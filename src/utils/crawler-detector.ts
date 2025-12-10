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
        // LLM Bots (AI Training & Inference)
        {
            pattern: /GPTBot/i,
            info: { crawlerName: 'GPTBot', company: 'OpenAI', type: 'llm' }
        },
        {
            pattern: /ChatGPT-User/i,
            info: { crawlerName: 'ChatGPT-User', company: 'OpenAI', type: 'llm' }
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
        {
            pattern: /PerplexityBot/i,
            info: { crawlerName: 'PerplexityBot', company: 'Perplexity AI', type: 'llm' }
        },
        {
            pattern: /Meta-ExternalAgent/i,
            info: { crawlerName: 'Meta-ExternalAgent', company: 'Meta', type: 'llm' }
        },
        {
            pattern: /FacebookBot/i,
            info: { crawlerName: 'FacebookBot', company: 'Meta', type: 'llm' }
        },
        {
            pattern: /cohere-ai/i,
            info: { crawlerName: 'Cohere Bot', company: 'Cohere', type: 'llm' }
        },
        {
            pattern: /AI2Bot/i,
            info: { crawlerName: 'AI2Bot', company: 'Allen Institute', type: 'llm' }
        },
        {
            pattern: /Applebot-Extended/i,
            info: { crawlerName: 'Applebot-Extended', company: 'Apple', type: 'llm' }
        },
        {
            pattern: /Bytespider/i,
            info: { crawlerName: 'Bytespider', company: 'ByteDance', type: 'llm' }
        },
        {
            pattern: /CCBot/i,
            info: { crawlerName: 'CCBot', company: 'Common Crawl', type: 'llm' }
        },
        {
            pattern: /Diffbot/i,
            info: { crawlerName: 'Diffbot', company: 'Diffbot', type: 'llm' }
        },
        {
            pattern: /ImagesiftBot/i,
            info: { crawlerName: 'ImagesiftBot', company: 'ImagesiftBot', type: 'llm' }
        },
        {
            pattern: /Omgilibot/i,
            info: { crawlerName: 'Omgilibot', company: 'Omgili', type: 'llm' }
        },
        {
            pattern: /YouBot/i,
            info: { crawlerName: 'YouBot', company: 'You.com', type: 'llm' }
        },
        {
            pattern: /Claude-Web/i,
            info: { crawlerName: 'Claude-Web', company: 'Anthropic', type: 'llm' }
        },
        {
            pattern: /Amazonbot/i,
            info: { crawlerName: 'Amazonbot', company: 'Amazon', type: 'llm' }
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
        {
            pattern: /Baiduspider/i,
            info: { crawlerName: 'Baiduspider', company: 'Baidu', type: 'search_engine' }
        },

        // Social
        {
            pattern: /facebookexternalhit/i,
            info: { crawlerName: 'FacebookBot', company: 'Meta', type: 'social' }
        },
        {
            pattern: /Twitterbot/i,
            info: { crawlerName: 'Twitterbot', company: 'Twitter/X', type: 'social' }
        },
        {
            pattern: /LinkedInBot/i,
            info: { crawlerName: 'LinkedInBot', company: 'LinkedIn', type: 'social' }
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
