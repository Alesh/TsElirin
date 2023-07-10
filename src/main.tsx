import '@/reset.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router-dom';
import UniChanProvider from '@/contexts/UniChan/Provider';
import CenteredLayout from '@/components/layouts/Centered';

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
  // <React.StrictMode>
  <UniChanProvider otherwise={<CenteredLayout>Please waite, connecting to remote a site ...</CenteredLayout>}>
    <RouterProvider router={createBrowserRouter(routes)} />
  </UniChanProvider>
  // </React.StrictMode>
);
