import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#15233f',
              color: '#e2e8f0',
              border: '1px solid #1e2c4a',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0b1120' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#0b1120' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
