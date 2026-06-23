import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle and suppress common sandbox/iframe errors like "Script error" and ResizeObserver warnings
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message === 'Script error.') {
      console.warn('CORS or sandbox Script error suppressed');
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event.message && (event.message.includes('ResizeObserver') || event.message.includes('Resize observer'))) {
      console.warn('Benign ResizeObserver warning suppressed');
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (reason && (
      (reason.message && reason.message.includes('popup')) ||
      (reason.code && reason.code.includes('auth/'))
    )) {
      console.warn('Benign unhandled rejection suppressed:', reason.message || reason);
      event.preventDefault();
      return;
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
