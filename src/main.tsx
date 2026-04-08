import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { CurrencyProvider } from './context/CurrencyContext'
import { LocationProvider } from './context/LocationContext'
import { NotificationProvider } from './context/NotificationContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CurrencyProvider>
      <LocationProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </LocationProvider>
    </CurrencyProvider>
  </React.StrictMode>
)

