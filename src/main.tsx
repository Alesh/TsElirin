import '@/reset.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router-dom';
import * as JsonRPC2 from '@/contexts/JsonRPC2';
import HomePage from '@/views/HomePage';
import VideoTest from '@/views/VideoTest';

// Application root routes
const routes = createRoutesFromElements(
  <Route>
    <Route index element={<HomePage />} />
    <Route path="video/*" element={<VideoTest />} />
    <Route path="*" element={<Navigate to={'/'} replace />} />
  </Route>
);

// Application root
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <JsonRPC2.Provider uri={'/rpc'}>
      <RouterProvider router={createBrowserRouter(routes)} />
    </JsonRPC2.Provider>
  </React.StrictMode>
);
