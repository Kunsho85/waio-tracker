import { Database } from 'bun:sqlite';
import path from 'path';

export interface Visit {
    id?: number;
    timestamp: string;
    botName: string;
    botType: string;
    botCompany: string;
    url: string;
    userAgent: string;
    ip: string;
    responseTime?: number;
}

export class SQLiteStore {
    private db: Database;

    constructor(dbPath: string = './data/waio.db') {
        // Ensure data directory exists
        const dir = path.dirname(dbPath);
        try {
            require('fs').mkdirSync(dir, { recursive: true });
        } catch (e) {
            // Directory might already exist
        }

        this.db = new Database(dbPath);
        this.initTables();
    }

    private initTables() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS visits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                bot_name TEXT NOT NULL,
                bot_type TEXT NOT NULL,
                bot_company TEXT NOT NULL,
                url TEXT NOT NULL,
                user_agent TEXT NOT NULL,
                ip TEXT NOT NULL,
                response_time INTEGER
            );

            CREATE INDEX IF NOT EXISTS idx_timestamp ON visits(timestamp);
            CREATE INDEX IF NOT EXISTS idx_bot_type ON visits(bot_type);
            CREATE INDEX IF NOT EXISTS idx_bot_name ON visits(bot_name);
        `);
    }

    public logVisit(visit: Visit): void {
        const stmt = this.db.prepare(`
            INSERT INTO visits (timestamp, bot_name, bot_type, bot_company, url, user_agent, ip, response_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            visit.timestamp,
            visit.botName,
            visit.botType,
            visit.botCompany,
            visit.url,
            visit.userAgent,
            visit.ip,
            visit.responseTime || null
        );
    }

    public getRecentVisits(limit: number = 10): Visit[] {
        const stmt = this.db.prepare(`
            SELECT 
                id,
                timestamp,
                bot_name as botName,
                bot_type as botType,
                bot_company as botCompany,
                url,
                user_agent as userAgent,
                ip,
                response_time as responseTime
            FROM visits
            ORDER BY timestamp DESC
            LIMIT ?
        `);

        return stmt.all(limit) as Visit[];
    }

    public getVisitsByType(): { type: string; count: number }[] {
        const stmt = this.db.prepare(`
            SELECT bot_type as type, COUNT(*) as count
            FROM visits
            GROUP BY bot_type
            ORDER BY count DESC
        `);

        return stmt.all() as { type: string; count: number }[];
    }

    public getVisitsByBot(): { botName: string; count: number }[] {
        const stmt = this.db.prepare(`
            SELECT bot_name as botName, COUNT(*) as count
            FROM visits
            GROUP BY bot_name
            ORDER BY count DESC
            LIMIT 20
        `);

        return stmt.all() as { botName: string; count: number }[];
    }

    public getTotalVisits(): number {
        const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM visits`);
        const result = stmt.get() as { count: number };
        return result.count;
    }

    // Time-based queries
    public getVisitsLast24Hours(): Visit[] {
        const stmt = this.db.prepare(`
            SELECT *
            FROM visits
            WHERE datetime(timestamp) >= datetime('now', '-24 hours')
            ORDER BY timestamp DESC
        `);
        return stmt.all() as Visit[];
    }

    public getVisitsLastWeek(): Visit[] {
        const stmt = this.db.prepare(`
            SELECT *
            FROM visits
            WHERE datetime(timestamp) >= datetime('now', '-7 days')
            ORDER BY timestamp DESC
        `);
        return stmt.all() as Visit[];
    }

    // Analytics
    public getBotTypeDistribution(): { type: string; count: number; percentage: number }[] {
        const total = this.getTotalVisits();
        const stmt = this.db.prepare(`
            SELECT 
                bot_type as type, 
                COUNT(*) as count,
                ROUND(COUNT(*) * 100.0 / ?, 2) as percentage
            FROM visits
            GROUP BY bot_type
            ORDER BY count DESC
        `);
        return stmt.all(total) as { type: string; count: number; percentage: number }[];
    }

    public getTopBots(limit: number = 10): { botName: string; visits: number }[] {
        const stmt = this.db.prepare(`
            SELECT bot_name as botName, COUNT(*) as visits
            FROM visits
            GROUP BY bot_name
            ORDER BY visits DESC
            LIMIT ?
        `);
        return stmt.all(limit) as { botName: string; visits: number }[];
    }

    public getHourlyDistribution(): { hour: number; visits: number }[] {
        const stmt = this.db.prepare(`
            SELECT 
                CAST(strftime('%H', timestamp) AS INTEGER) as hour,
                COUNT(*) as visits
            FROM visits
            GROUP BY hour
            ORDER BY hour
        `);
        return stmt.all() as { hour: number; visits: number }[];
    }

    public getAverageResponseTime(): number {
        const stmt = this.db.prepare(`
            SELECT AVG(response_time) as avg
            FROM visits
            WHERE response_time IS NOT NULL
        `);
        const result = stmt.get() as { avg: number | null };
        return result.avg ? Math.round(result.avg) : 0;
    }

    public getUniqueIPs(): number {
        const stmt = this.db.prepare(`SELECT COUNT(DISTINCT ip) as count FROM visits`);
        const result = stmt.get() as { count: number };
        return result.count;
    }

    // Trends
    public getVisitTrend(days: number = 7): { date: string; visits: number }[] {
        const stmt = this.db.prepare(`
            SELECT 
                DATE(timestamp) as date,
                COUNT(*) as visits
            FROM visits
            WHERE datetime(timestamp) >= datetime('now', '-' || ? || ' days')
            GROUP BY date
            ORDER BY date
        `);
        return stmt.all(days) as { date: string; visits: number }[];
    }

    public getLast24HoursCount(): number {
        const stmt = this.db.prepare(`
            SELECT COUNT(*) as count
            FROM visits
            WHERE datetime(timestamp) >= datetime('now', '-24 hours')
        `);
        const result = stmt.get() as { count: number };
        return result.count;
    }

    public getBotTypeCount(type: string): number {
        const stmt = this.db.prepare(`
            SELECT COUNT(*) as count
            FROM visits
            WHERE bot_type = ?
        `);
        const result = stmt.get(type) as { count: number };
        return result.count;
    }

    // URL-specific queries
    public getVisitsByUrl(url: string): Visit[] {
        const stmt = this.db.prepare(`
            SELECT 
                id,
                timestamp,
                bot_name as botName,
                bot_type as botType,
                bot_company as botCompany,
                url,
                user_agent as userAgent,
                ip,
                response_time as responseTime
            FROM visits
            WHERE url LIKE ?
            ORDER BY timestamp DESC
        `);
        return stmt.all(`%${url}%`) as Visit[];
    }

    public getUrlStats(url: string): {
        totalVisits: number;
        uniqueBots: number;
        lastVisit: string | null;
        botBreakdown: { botName: string; count: number }[];
    } {
        const visits = this.getVisitsByUrl(url);
        const uniqueBots = new Set(visits.map(v => v.botName)).size;
        const lastVisit = visits.length > 0 ? visits[0].timestamp : null;
        
        const stmt = this.db.prepare(`
            SELECT bot_name as botName, COUNT(*) as count
            FROM visits
            WHERE url LIKE ?
            GROUP BY bot_name
            ORDER BY count DESC
        `);
        const botBreakdown = stmt.all(`%${url}%`) as { botName: string; count: number }[];
        
        return {
            totalVisits: visits.length,
            uniqueBots,
            lastVisit,
            botBreakdown
        };
    }

    public getUrlTrend(url: string, days: number = 7): { date: string; visits: number }[] {
        const stmt = this.db.prepare(`
            SELECT 
                DATE(timestamp) as date,
                COUNT(*) as visits
            FROM visits
            WHERE url LIKE ? 
              AND datetime(timestamp) >= datetime('now', '-' || ? || ' days')
            GROUP BY date
            ORDER BY date
        `);
        return stmt.all(`%${url}%`, days) as { date: string; visits: number }[];
    }

    public getUrlBotTypeCount(url: string, type: string): number {
        const stmt = this.db.prepare(`
            SELECT COUNT(*) as count
            FROM visits
            WHERE url LIKE ? AND bot_type = ?
        `);
        const result = stmt.get(`%${url}%`, type) as { count: number };
        return result.count;
    }

    public close() {
        this.db.close();
    }
}
