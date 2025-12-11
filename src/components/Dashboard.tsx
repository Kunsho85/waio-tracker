import React, { useEffect, useState } from 'react';
import { StatsCard } from './StatsCard';
import { VisitChart } from './charts/VisitChart';
import { UrlTester } from './UrlTester';
import { LiveBotFeed } from './LiveBotFeed';

interface DashboardStats {
    totalVisits: number;
    uniqueIPs: number;
    avgResponseTime: number;
    activeBots: number;
    llmBots: number;
    searchBots: number;
    socialBots: number;
    last24h: number;
    trend: string;
    topBot: string;
}

export const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch real stats from API
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/stats/dashboard');
                const data = await response.json();
                setStats(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
                setLoading(false);
            }
        };

        fetchStats();
        // Refresh stats every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    // WebSocket for real-time updates
    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${window.location.host}/api/stream`);

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'VISIT_UPDATE' && stats) {
                // Increment total visits on new visit
                setStats(prev => prev ? { ...prev, totalVisits: prev.totalVisits + 1 } : null);
            }
        };

        ws.onopen = () => console.log('Connected to real-time stream');
        ws.onerror = (error) => console.error('WebSocket error:', error);

        return () => ws.close();
    }, [stats]);

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (!stats) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Failed to load dashboard stats. Please refresh.</p>
            </div>
        );
    }

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
                <StatsCard 
                    title="Total Visits" 
                    value={stats.totalVisits.toLocaleString()} 
                    description={`${stats.trend} from yesterday`} 
                />
                <StatsCard 
                    title="LLM Bots" 
                    value={stats.llmBots} 
                    description={`${stats.topBot} most active`} 
                />
                <StatsCard 
                    title="Active Bots (24h)" 
                    value={stats.activeBots} 
                    description={`${stats.last24h} visits today`} 
                />
                <StatsCard 
                    title="Avg Response" 
                    value={`${stats.avgResponseTime}ms`} 
                    description={`${stats.uniqueIPs} unique IPs`} 
                />
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
