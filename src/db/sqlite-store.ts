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

    public close() {
        this.db.close();
    }
}
