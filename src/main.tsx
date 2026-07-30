import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';

// Panggil semua CSS inti lu di sini biar Tailwind beneran nyala!
// @ts-ignore
import './styles/tailwind.css';
// @ts-ignore
import './styles/index.css';
// @ts-ignore
import './styles/globals.css';

import { initializeStore } from './app/store';

// Inisialisasi API Railway
initializeStore();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);