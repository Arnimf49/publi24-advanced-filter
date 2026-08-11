import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './nimfomane-font.scss';
import './styles.scss';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Presentation root element was not found.');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
