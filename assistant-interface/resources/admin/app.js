import { createRoot } from '@wordpress/element';

import AppRouter from './AppRouter';
import './app.css';

console.log('App.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('#ai-assistant-container');

    if (container) {
        const root = createRoot(container);
        root.render(<AppRouter />);
    } else {
        console.error('Container #ai-assistant-container not found!');
    }
});
