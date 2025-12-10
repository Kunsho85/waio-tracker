import { CrawlerDetector } from "./utils/crawler-detector";
import { HtmlGenerator } from "./generators/html-generator";
import { CrawlerSimulator } from "./simulation/crawler-simulator";
import { ReportGenerator } from "./reporting/report-generator";
import { SQLiteStore } from "./db/sqlite-store";
import type { Server, ServerWebSocket } from "bun";

// Initialize services
const connectedClients = new Set<any>();
const crawlerDetector = new CrawlerDetector();
const htmlGenerator = new HtmlGenerator();
const crawlerSimulator = new CrawlerSimulator();
const reportGenerator = new ReportGenerator();
const db = new SQLiteStore();

// Log visit to database and broadcast to WebSocket clients
const logVisit = async (path: string, userAgent: string, ip: string, crawlerInfo: any) => {
  const logData = {
    timestamp: new Date().toISOString(),
    url: path,
    userAgent,
    ip,
    botName: crawlerInfo.crawlerName,
    botType: crawlerInfo.type,
    botCompany: crawlerInfo.company
  };
  
  // 1. Save to database
  db.logVisit(logData);

  // 2. Log to console
  console.log("Visit:", JSON.stringify(logData));

  // 3. Broadcast to WebSockets
  const message = JSON.stringify({ type: 'VISIT_UPDATE', data: logData });
  for (const client of connectedClients) {
    try {
      client.send(message);
    } catch (e) {
      connectedClients.delete(client);
    }
  }
};

const server = Bun.serve({
  port: process.env.PORT || 3000,

  // Upgrade to WebSocket
  websocket: {
    message(ws: ServerWebSocket<any>, message: string | Buffer) {
      // Handle incoming messages if needed
    },
    open(ws: ServerWebSocket<any>) {
      connectedClients.add(ws);
      console.log("Client connected. Total:", connectedClients.size);
    },
    close(ws: ServerWebSocket<any>) {
      connectedClients.delete(ws);
      console.log("Client disconnected. Total:", connectedClients.size);
    },
    drain(ws: ServerWebSocket<any>) { }
  },

  async fetch(req: Request, server: Server<any>) {
    const url = new URL(req.url);

    // Helper function to add security headers
    const addSecurityHeaders = (response: Response): Response => {
      const headers = new Headers(response.headers);
      headers.set('X-Frame-Options', 'SAMEORIGIN');
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('X-XSS-Protection', '1; mode=block');
      headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    };

    // 1. WebSocket Upgrade
    if (url.pathname === "/api/stream") {
      if (server.upgrade(req)) {
        return; // Upgraded
      }
      return addSecurityHeaders(new Response("WebSocket upgrade failed", { status: 400 }));
    }

    // 1.5 Simulation Endpoint
    if (url.pathname === "/api/simulate" && req.method === "POST") {
      try {
        const body = await req.json() as { targetUrl: string, agent?: 'Googlebot' | 'GPTBot' | 'Bingbot' | 'Mobile' };
        const { targetUrl, agent } = body;

        if (!targetUrl) return addSecurityHeaders(new Response("Missing targetUrl", { status: 400 }));

        console.log(`Starting simulation: ${agent} -> ${targetUrl}`);
        const result = await crawlerSimulator.simulateVisit(targetUrl, agent || 'Googlebot');

        return addSecurityHeaders(new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" }
        }));
      } catch (e: any) {
        return addSecurityHeaders(new Response(JSON.stringify({ error: String(e) }), { status: 500 }));
      }
    }

    // 1.6 Report Endpoint
    if (url.pathname === "/api/report") {
        const visits = db.getRecentVisits(100);
        const report = reportGenerator.generateTextReport(visits);
        return addSecurityHeaders(new Response(report, { headers: { "Content-Type": "text/plain" } }));
    }

    // 1.7 Recent Visits API
    if (url.pathname === "/api/visits/recent") {
        const visits = db.getRecentVisits(10);
        return addSecurityHeaders(new Response(JSON.stringify(visits), { 
            headers: { "Content-Type": "application/json" } 
        }));
    }

    // 1.8 Bot Statistics API
    if (url.pathname === "/api/stats/bots") {
        const byType = db.getVisitsByType();
        const byBot = db.getVisitsByBot();
        const total = db.getTotalVisits();
        
        return addSecurityHeaders(new Response(JSON.stringify({ byType, byBot, total }), { 
            headers: { "Content-Type": "application/json" } 
        }));
    }

    // 2. Serve built client bundle
    if (url.pathname === "/client.js") {
      try {
        const build = await Bun.build({
          entrypoints: ["./src/client.tsx"],
          target: "browser",
        });

        if (!build.success) {
          console.error("Build failed:", build.logs);
          return addSecurityHeaders(new Response("Build failed: " + JSON.stringify(build.logs), { status: 500 }));
        }

        return addSecurityHeaders(new Response(build.outputs[0]));
      } catch (error) {
        console.error("Bundling error:", error);
        return addSecurityHeaders(new Response("Bundling error: " + error, { status: 500 }));
      }
    }

    // 3. Test Pages Dynamic Route
    if (url.pathname.startsWith("/test/")) {
      const pageId = url.pathname.split("/test/")[1];
      const userAgent = req.headers.get("User-Agent") || "";
      // Bun specific IP retrieval (server.requestIP is available in Bun 1.0+)
      const ip = server.requestIP(req)?.address || "unknown";

      // Detect Crawler
      const crawlerInfo = crawlerDetector.identify(userAgent);

      // Log Visit (async)
      // Don't await to keep response fast
      logVisit(url.pathname, userAgent, ip, crawlerInfo);

      // Serve Page
      const html = htmlGenerator.generateTestPage(pageId);
      return addSecurityHeaders(new Response(html, { headers: { "Content-Type": "text/html" } }));
    }

    // 4. Serve Main App (SPA)
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WAIO Crawler Tracker (Bun)</title>
        <style>
          body { margin: 0; background: #f2f2f7; font-family: system-ui, -apple-system, sans-serif; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="/client.js"></script>
        <script>
            // Simple WS client to test connection
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const ws = new WebSocket(protocol + "//" + window.location.host + "/api/stream");
            ws.onmessage = (event) => console.log("WS Data:", JSON.parse(event.data));
            ws.onopen = () => console.log("Connected to Real-time Stream");
        </script>
      </body>
      </html>
    `;

    return addSecurityHeaders(new Response(html, {
      headers: {
        "Content-Type": "text/html",
      },
    }));
  },
});

console.log(`Listening on http://localhost:${server.port} ...`);
