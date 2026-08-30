import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ControlPlaneCompositeProvider } from './context/ControlPlaneCompositeProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ControlPlaneCompositeProvider>
      <App />
    </ControlPlaneCompositeProvider>
  </React.StrictMode>
);
