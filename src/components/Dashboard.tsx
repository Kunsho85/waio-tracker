import React, { useEffect, useState } from 'react';
import { StatsCard } from './StatsCard';
import { VisitChart } from './charts/VisitChart';
import { UrlTester } from './UrlTester';
import { LiveBotFeed } from './LiveBotFeed';

export const Dashboard = () => {
    const [visitCount, setVisitCount] = useState(0);

    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${window.location.host}/api/stream`);

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'VISIT_UPDATE') {
                setVisitCount(prev => prev + 1);
            }
        };

        return () => ws.close();
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ margin: 0 }}>WAIO Analytics Dashboard</h1>
                <a
                    href="/api/report"
                    target="_blank"
                    style={{
                        textDecoration: 'none',
                        background: '#007AFF',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}
                >
                    View Daily Report 📄
                </a>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <StatsCard title="Total Visits" value={1254 + visitCount} description="+12% from last week" />
                <StatsCard title="Active Crawlers" value="5" description="Googlebot, GPTBot active" />
                <StatsCard title="Avg Response" value="45ms" description="Optimized by Bun" />
            </div>

            <div style={{ marginBottom: '30px' }}>
                <LiveBotFeed />
            </div>

            <div style={{
                background: 'white',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <VisitChart />
            </div>

            <UrlTester />
        </div>
    );
};
