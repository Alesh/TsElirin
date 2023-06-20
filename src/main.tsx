import React from 'react';
import ReactDOM from 'react-dom/client';
import { RPCProvider } from '@elirin/react/hooks/useRPC';
import App from '@/App.tsx';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RPCProvider wsUri={'/rpc'}>
      <App />
    </RPCProvider>
  </React.StrictMode>
);
