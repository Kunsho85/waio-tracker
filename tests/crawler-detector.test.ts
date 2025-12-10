import { test, expect, describe } from "bun:test";
import { CrawlerDetector } from "../src/utils/crawler-detector";

describe("CrawlerDetector", () => {
    const detector = new CrawlerDetector();

    test("should detect GPTBot", () => {
        const ua = "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)";
        const result = detector.identify(ua);

        expect(result.crawlerName).toBe("GPTBot");
        expect(result.company).toBe("OpenAI");
        expect(result.type).toBe("llm");
    });

    test("should detect ClaudeBot", () => {
        const ua = "Mozilla/5.0 (compatible; ClaudeBot/1.0; +https://www.anthropic.com/bot)";
        const result = detector.identify(ua);

        expect(result.crawlerName).toBe("ClaudeBot");
        expect(result.company).toBe("Anthropic");
        expect(result.type).toBe("llm");
    });

    test("should detect Googlebot", () => {
        const ua = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
        const result = detector.identify(ua);

        expect(result.crawlerName).toBe("Googlebot");
        expect(result.company).toBe("Google");
        expect(result.type).toBe("search_engine");
    });

    test("should detect generic bots", () => {
        const ua = "SomeRandomSpider/1.0";
        const result = detector.identify(ua);
        expect(result.crawlerName).toBe("Generic Bot");
        expect(result.type).toBe("other");
    });

    test("should return unknown for normal browsers", () => {
        const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
        const result = detector.identify(ua);
        expect(result.type).toBe("unknown");
    });
});
