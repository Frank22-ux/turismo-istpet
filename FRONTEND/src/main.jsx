import React from 'react'
import ReactDOM from 'react-dom/client'
// Importante: Asegúrate que App.jsx esté junto a main.jsx en la carpeta src
import App from './App.jsx' 
import './core/styles/variables.css';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)