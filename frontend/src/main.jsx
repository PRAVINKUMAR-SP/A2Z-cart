import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// In Native Android Capacitor APK, route /api calls to the live EC2 backend
if (typeof window !== 'undefined') {
  const isNative = window.location.protocol === 'capacitor:' || 
                   Boolean(window.Capacitor?.isNativePlatform?.()) || 
                   (window.location.origin === 'http://localhost' && navigator.userAgent.includes('Android'));
  if (isNative) {
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      if (typeof input === 'string' && input.startsWith('/api')) {
        return originalFetch(`http://15.206.84.110${input}`, init);
      }
      return originalFetch(input, init);
    };
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
