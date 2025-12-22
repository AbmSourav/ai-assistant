import { createRoot } from '@wordpress/element';
import HelloWorld from './components/HelloWorld';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('#ai-assistant-container');

    if (container) {
        const root = createRoot(container);
        root.render(<HelloWorld />);
    }
});
