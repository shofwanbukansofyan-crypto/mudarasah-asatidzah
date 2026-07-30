import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'

// @ts-ignore: Mengabaikan warning TS untuk import file CSS
import './styles/globals.css'
import { initializeStore } from './app/store'

// Tarik data dari Railway di background saat web diload
initializeStore();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)