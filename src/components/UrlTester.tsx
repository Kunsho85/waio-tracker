import React, { useState } from 'react';

interface UrlTesterProps {
    onUrlTested?: (url: string) => void;
}

export const UrlTester = ({ onUrlTested }: UrlTesterProps) => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSimulate = async (agent: string) => {
        setLoading(true);
        setResult(null);
        try {
            const response = await fetch('/api/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUrl: url, agent })
            });
            const data = await response.json();
            setResult(data);
            
            // Notify parent component that URL was tested
            if (onUrlTested && url) {
                onUrlTested(url);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            marginTop: '30px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
            <h2 style={{ marginTop: 0 }}>External URL Tester</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter URL to test (e.g., https://example.com)"
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        fontSize: '16px'
                    }}
                />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    onClick={() => handleSimulate('Googlebot')}
                    disabled={loading || !url}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#EA4335',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}>
                    {loading ? 'Simulating...' : 'Test as Googlebot'}
                </button>
                <button
                    onClick={() => handleSimulate('GPTBot')}
                    disabled={loading || !url}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#10A37F',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}>
                    {loading ? 'Simulating...' : 'Test as GPTBot'}
                </button>
            </div>

            {result && (
                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div>
                            <strong>Load Time:</strong> {result.loadTime}ms
                        </div>
                        <div>
                            <strong>Resources:</strong> {result.resourceCount}
                        </div>
                        <div>
                            <strong>Status:</strong> {result.status}
                        </div>
                    </div>
                    {result.screenshot && (
                        <div>
                            <strong>Crawler Vision:</strong>
                            <img
                                src={`data:image/png;base64,${result.screenshot}`}
                                alt="Crawler Screenshot"
                                style={{ width: '100%', marginTop: '10px', borderRadius: '8px', border: '1px solid #eee' }}
                            />
                        </div>
                    )}
                    {result.error && (
                        <div style={{ color: 'red' }}>Error: {result.error}</div>
                    )}
                </div>
            )}
        </div>
    );
};
