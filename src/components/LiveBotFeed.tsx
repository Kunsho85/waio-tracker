import React, { useState, useEffect } from 'react';

interface Visit {
    id: number;
    timestamp: string;
    botName: string;
    botType: string;
    botCompany: string;
    url: string;
}

export const LiveBotFeed = () => {
    const [visits, setVisits] = useState<Visit[]>([]);

    useEffect(() => {
        // Fetch initial visits
        fetch('/api/visits/recent')
            .then(res => res.json())
            .then(data => setVisits(data))
            .catch(err => console.error('Failed to load visits:', err));

        // Connect to WebSocket for real-time updates
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${window.location.host}/api/stream`);
        
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'VISIT_UPDATE') {
                setVisits(prev => [message.data, ...prev].slice(0, 10));
            }
        };

        return () => ws.close();
    }, []);

    const getBotTypeColor = (type: string) => {
        switch (type) {
            case 'llm': return '#FF6B6B';
            case 'search_engine': return '#4ECDC4';
            case 'social': return '#95E1D3';
            default: return '#999';
        }
    };

    const getBotTypeLabel = (type: string) => {
        switch (type) {
            case 'llm': return '🤖 LLM';
            case 'search_engine': return '🔍 Search';
            case 'social': return '📱 Social';
            default: return '❓ Other';
        }
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>
                🔴 Live Bot Feed
            </h2>
            
            {visits.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                    Waiting for bot visits...
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {visits.map((visit) => (
                        <div
                            key={visit.id}
                            style={{
                                padding: '12px',
                                background: '#f8f9fa',
                                borderRadius: '8px',
                                borderLeft: `4px solid ${getBotTypeColor(visit.botType)}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{
                                        background: getBotTypeColor(visit.botType),
                                        color: 'white',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        fontWeight: 'bold'
                                    }}>
                                        {getBotTypeLabel(visit.botType)}
                                    </span>
                                    <strong>{visit.botName}</strong>
                                    <span style={{ color: '#666', fontSize: '12px' }}>
                                        ({visit.botCompany})
                                    </span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    {visit.url}
                                </div>
                            </div>
                            <div style={{ fontSize: '11px', color: '#999', textAlign: 'right' }}>
                                {new Date(visit.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
