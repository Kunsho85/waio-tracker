import React from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, description }) => {
    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            flex: '1',
            minWidth: '200px'
        }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px', textTransform: 'uppercase' }}>{title}</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111' }}>{value}</div>
            {description && <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>{description}</div>}
        </div>
    );
};
