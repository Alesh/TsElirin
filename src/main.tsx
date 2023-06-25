import '@/reset.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router-dom';
import { RPCProvider } from 'packages/elirin/react/hooks/useRPClient';
import VideoTest from '@/views/VideoTest';

// Application root routes
const routes = createRoutesFromElements(
  <Route>
    <Route index element={<Navigate to={'/video'} replace />} />
    <Route path="video/*" element={<VideoTest />} />
    <Route path="*" element={<Navigate to={'/'} replace />} />
  </Route>
);

// Application root
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RPCProvider wsUri={'/rpc'}>
      <RouterProvider router={createBrowserRouter(routes)} />
    </RPCProvider>
  </React.StrictMode>
);
