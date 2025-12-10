import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log('[WAIO] Client script loaded');

const container = document.getElementById('root');
console.log('[WAIO] Root container:', container);

if (container) {
    try {
        console.log('[WAIO] Creating React root...');
        const root = createRoot(container);
        console.log('[WAIO] Rendering App...');
        root.render(<App />);
        console.log('[WAIO] App rendered successfully!');
    } catch (error) {
        console.error('[WAIO] Error rendering app:', error);
        container.innerHTML = `<div style="padding: 20px; color: red;">
            <h1>Error Loading App</h1>
            <pre>${error}</pre>
        </div>`;
    }
} else {
    console.error('[WAIO] Root container not found!');
}
