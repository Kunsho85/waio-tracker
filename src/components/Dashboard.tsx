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
    filteredUrl?: string | null;
}

export const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterUrl, setFilterUrl] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    // Fetch real stats from API
    const fetchStats = async (url?: string) => {
        try {
            const endpoint = url 
                ? `/api/stats/dashboard?url=${encodeURIComponent(url)}`
                : '/api/stats/dashboard';
            const response = await fetch(endpoint);
            const data = await response.json();
            setStats(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats(activeFilter || undefined);
        // Refresh stats every 30 seconds
        const interval = setInterval(() => fetchStats(activeFilter || undefined), 30000);
        return () => clearInterval(interval);
    }, [activeFilter]);

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

    const applyFilter = () => {
        if (filterUrl.trim()) {
            setActiveFilter(filterUrl.trim());
        }
    };

    const clearFilter = () => {
        setFilterUrl('');
        setActiveFilter(null);
    };

    const handleUrlTested = (url: string) => {
        setFilterUrl(url);
        setActiveFilter(url);
    };

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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

            {/* URL Filter */}
            <div style={{
                background: 'white',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
            }}>
                <input
                    type="text"
                    placeholder="Filter by URL (e.g., https://example.com or example.com)"
                    value={filterUrl}
                    onChange={(e) => setFilterUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && applyFilter()}
                    style={{
                        flex: 1,
                        padding: '10px 14px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none'
                    }}
                />
                <button
                    onClick={applyFilter}
                    style={{
                        background: '#007AFF',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    🔍 Filter
                </button>
                {activeFilter && (
                    <button
                        onClick={clearFilter}
                        style={{
                            background: '#FF3B30',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        ✕ Clear
                    </button>
                )}
            </div>

            {/* Active Filter Indicator */}
            {activeFilter && (
                <div style={{
                    background: '#E3F2FD',
                    border: '2px solid #2196F3',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span style={{ fontSize: '18px' }}>📊</span>
                    <span style={{ fontWeight: 'bold', color: '#1976D2' }}>
                        Analyzing: {activeFilter}
                    </span>
                </div>
            )}

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

            <UrlTester onUrlTested={handleUrlTested} />
        </div>
    );
};
