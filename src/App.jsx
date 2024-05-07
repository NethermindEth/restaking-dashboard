import './App.css';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom';
import AVS from './avs/AVS';
import Home from './home/Home';
import Layout from './shared/Layout';
import log from './shared/logger';
import LRT from './lrt/LRT';
import { NextUIProvider } from '@nextui-org/react';
import { ServiceProvider } from './@services/ServiceContext';
import { ThemeProvider } from './shared/ThemeContext';

export default function App() {
  log.debug('Starting up');

  return (
    <NextUIProvider>
      <ThemeProvider>
        <ServiceProvider>
          <RouterProvider
            router={createBrowserRouter(
              createRoutesFromElements(
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="/avs" element={<AVS />} />
                  <Route path="/lrt" element={<LRT />} />
                </Route>
              )
            )}
          />
        </ServiceProvider>
      </ThemeProvider>
    </NextUIProvider>
  );
}
