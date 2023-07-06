import '@/reset.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { UniChanProvider } from '@/contexts/UniChan';
import App from '@/App.tsx';
import CenteredLayout from '@/components/layouts/Centered.tsx';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <UniChanProvider otherwise={<CenteredLayout>Please waite, connecting to remote a site ...</CenteredLayout>}>
      <App />
    </UniChanProvider>
  </React.StrictMode>
);
