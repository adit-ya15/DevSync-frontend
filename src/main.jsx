import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Apply saved theme immediately to prevent flash
const savedTheme = localStorage.getItem('devSync-theme');
if (savedTheme === 'light') {
  document.documentElement.setAttribute('data-theme', 'light');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
