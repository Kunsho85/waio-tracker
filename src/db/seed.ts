import { SQLiteStore } from './sqlite-store';

// Seed database with sample data for testing
export function seedDatabase(db: SQLiteStore) {
    console.log('[WAIO] Seeding database with sample data...');
    
    const sampleBots = [
        { name: 'GPTBot', type: 'llm', company: 'OpenAI' },
        { name: 'ClaudeBot', type: 'llm', company: 'Anthropic' },
        { name: 'Googlebot', type: 'search_engine', company: 'Google' },
        { name: 'Bingbot', type: 'search_engine', company: 'Microsoft' },
        { name: 'PerplexityBot', type: 'llm', company: 'Perplexity AI' },
    ];

    const sampleUrls = ['/test/page1', '/test/page2', '/', '/api/test'];
    const sampleIPs = ['192.168.1.1', '10.0.0.1', '172.16.0.1'];

    // Generate visits for the last 7 days
    const now = new Date();
    for (let day = 0; day < 7; day++) {
        const visitsPerDay = Math.floor(Math.random() * 20) + 10; // 10-30 visits per day
        
        for (let i = 0; i < visitsPerDay; i++) {
            const bot = sampleBots[Math.floor(Math.random() * sampleBots.length)];
            const url = sampleUrls[Math.floor(Math.random() * sampleUrls.length)];
            const ip = sampleIPs[Math.floor(Math.random() * sampleIPs.length)];
            
            const visitDate = new Date(now);
            visitDate.setDate(visitDate.getDate() - day);
            visitDate.setHours(Math.floor(Math.random() * 24));
            visitDate.setMinutes(Math.floor(Math.random() * 60));
            
            db.logVisit({
                timestamp: visitDate.toISOString(),
                botName: bot.name,
                botType: bot.type,
                botCompany: bot.company,
                url,
                userAgent: `Mozilla/5.0 (compatible; ${bot.name}/1.0)`,
                ip,
                responseTime: Math.floor(Math.random() * 500) + 50 // 50-550ms
            });
        }
    }
    
    const totalVisits = db.getTotalVisits();
    console.log(`[WAIO] Seeded ${totalVisits} sample visits`);
}
