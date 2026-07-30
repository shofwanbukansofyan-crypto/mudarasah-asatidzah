import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/globals.css'
import { initializeStore } from './app/store' // Tambahkan baris import ini

// Panggil inisialisasi background untuk menarik data dari Railway
initializeStore(); 

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)