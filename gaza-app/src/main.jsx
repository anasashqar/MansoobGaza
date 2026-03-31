import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LangProvider } from './context/LangContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </StrictMode>,
)
