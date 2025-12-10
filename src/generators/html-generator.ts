export class HtmlGenerator {
    generateTestPage(pageId: string, title: string = "Test Page"): string {
        const timestamp = new Date().toISOString();
        return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WAIO Test Page: ${title} (${pageId})</title>
        <meta name="description" content="This is a test page for identifying crawler behavior. Generated at ${timestamp}">
        <meta property="og:title" content="WAIO Test Page - ${pageId}">
        <style>
          body { font-family: sans-serif; padding: 20px; line-height: 1.6; }
          .content { max-width: 800px; margin: 0 auto; }
          .metadata { background: #f0f0f0; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="content">
          <h1>Test Content for ${pageId}</h1>
          <div class="metadata">
            <p><strong>Generated:</strong> ${timestamp}</p>
            <p><strong>Page ID:</strong> ${pageId}</p>
          </div>
          <p>
            This page represents a generic piece of content used to analyze how different
            crawlers (Search Engines, LLMs) parse and index the web. 
          </p>
          <p>
             Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
             incididunt ut labore et dolore magna aliqua. 
          </p>
          <div id="waio-data" data-waio-id="${pageId}" style="display:none;"></div>
        </div>
      </body>
      </html>
    `;
    }
}
