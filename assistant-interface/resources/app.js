import { createRoot } from '@wordpress/element';
import IndexForm from './components/IndexForm';
import './app.css';

console.log('App.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('#ai-assistant-container');

    if (container) {
        const root = createRoot(container);
        root.render(<IndexForm />);
    } else {
        console.error('Container #ai-assistant-container not found!');
    }
});
