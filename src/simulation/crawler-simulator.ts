import { chromium, Browser, Page } from 'playwright';

export interface SimulationResult {
    loadTime: number;
    resourceCount: number;
    screenshot?: string; // base64
    status: number;
    success: boolean;
    error?: string;
    simulatedAgent: string;
}

export class CrawlerSimulator {
    private browser: Browser | null = null;

    async init() {
        if (!this.browser) {
            // In Docker/Bun, we might need specific launch options
            this.browser = await chromium.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
    }

    async simulateVisit(url: string, userAgentType: 'Googlebot' | 'GPTBot' | 'Bingbot' | 'Mobile'): Promise<SimulationResult> {
        await this.init();
        if (!this.browser) throw new Error("Browser failed to initialize");

        const page = await this.browser.newPage();
        const startTime = performance.now();
        let resourceCount = 0;

        // Set User Agent
        const uas = {
            'Googlebot': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            'GPTBot': 'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
            'Bingbot': 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
            'Mobile': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
        };

        await page.setExtraHTTPHeaders({
            'User-Agent': uas[userAgentType] || uas['Googlebot']
        });

        page.on('response', () => resourceCount++);

        try {
            const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
            const endTime = performance.now();

            const screenshotBuffer = await page.screenshot();
            const screenshot = screenshotBuffer.toString('base64');

            return {
                loadTime: Math.round(endTime - startTime),
                resourceCount,
                status: response?.status() || 0,
                success: true,
                screenshot,
                simulatedAgent: userAgentType
            };

        } catch (e: any) {
            return {
                loadTime: 0,
                resourceCount: 0,
                status: 0,
                success: false,
                error: e.message,
                simulatedAgent: userAgentType
            };
        } finally {
            await page.close();
        }
    }

    async close() {
        if (this.browser) await this.browser.close();
    }
}
