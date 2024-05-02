import './App.css';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom';
import AVSList from './avs/AVSList';
import Home from './home/Home';
import Layout from './shared/Layout';
import log from './shared/logger';
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider } from './shared/ThemeContext';

export default function App() {
  log.debug('Starting up');

  return (
    <NextUIProvider>
      <ThemeProvider>
        <RouterProvider
          router={createBrowserRouter(
            createRoutesFromElements(
              <Route path="/" element={<Layout />}>
                <Route index element={<AVSList />} />
                <Route path="/avs" element={<AVSList />} />
              </Route>
            )
          )}
        />
      </ThemeProvider>
    </NextUIProvider>
  );
}
