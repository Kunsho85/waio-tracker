export interface CrawlerInfo {
    crawlerName: string;
    company: string;
    type: 'search_engine' | 'llm' | 'social' | 'other' | 'unknown';
}

interface CrawlerRule {
    pattern: RegExp;
    info: CrawlerInfo;
}

export class CrawlerDetector {
    private rules: CrawlerRule[] = [
        // LLM Bots
        {
            pattern: /GPTBot/i,
            info: { crawlerName: 'GPTBot', company: 'OpenAI', type: 'llm' }
        },
        {
            pattern: /ClaudeBot/i,
            info: { crawlerName: 'ClaudeBot', company: 'Anthropic', type: 'llm' }
        },
        {
            pattern: /anthropic-ai/i,
            info: { crawlerName: 'Anthropic AI', company: 'Anthropic', type: 'llm' }
        },
        {
            pattern: /Google-Extended/i,
            info: { crawlerName: 'Google-Extended', company: 'Google', type: 'llm' }
        },

        // Search Engines
        {
            pattern: /Googlebot/i,
            info: { crawlerName: 'Googlebot', company: 'Google', type: 'search_engine' }
        },
        {
            pattern: /bingbot/i,
            info: { crawlerName: 'Bingbot', company: 'Microsoft', type: 'search_engine' }
        },
        {
            pattern: /Yandex/i,
            info: { crawlerName: 'YandexBot', company: 'Yandex', type: 'search_engine' }
        },
        {
            pattern: /DuckDuckBot/i,
            info: { crawlerName: 'DuckDuckBot', company: 'DuckDuckGo', type: 'search_engine' }
        },

        // Social
        {
            pattern: /facebookexternalhit/i,
            info: { crawlerName: 'FacebookBot', company: 'Meta', type: 'social' }
        },
        {
            pattern: /Twitterbot/i,
            info: { crawlerName: 'Twitterbot', company: 'Twitter/X', type: 'social' }
        }
    ];

    public identify(userAgent: string): CrawlerInfo {
        if (!userAgent) {
            return { crawlerName: 'Unknown', company: 'Unknown', type: 'unknown' };
        }

        for (const rule of this.rules) {
            if (rule.pattern.test(userAgent)) {
                return rule.info;
            }
        }

        // Default: Check if it looks like a bot generally
        if (/bot|crawl|spider|slurp/i.test(userAgent)) {
            return { crawlerName: 'Generic Bot', company: 'Unknown', type: 'other' };
        }

        return { crawlerName: 'Unknown', company: 'Unknown', type: 'unknown' };
    }
}
