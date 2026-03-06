import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { AuthProvider } from './context/authContext';

console.log("[index.tsx] Starting");

const rootElement = document.getElementById('root');
console.log("[index.tsx] Root element:", rootElement);

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

console.log("[index.tsx] Root created, rendering");

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

console.log("[index.tsx] Render call completed");