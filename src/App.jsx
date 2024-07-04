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
import LRT from './lrt/LRT';
import { NextUIProvider } from '@nextui-org/react';
import { ServiceProvider } from './@services/ServiceContext';
import { ThemeProvider } from './shared/ThemeContext';
import AVSDetails from './avs/AVSDetails';
import OperatorsList from './operators/OperatorsList';
import OperatorDetails from './operators/OperatorDetails';

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
                  <Route path="/avs" element={<AVSList />} />
                  <Route path="/avs/:address" element={<AVSDetails />} />
                  <Route path="/lrt" element={<LRT />} />
                  <Route path="/operators" element={<OperatorsList />} />
                  <Route
                    path="/operators/:address"
                    element={<OperatorDetails />}
                  />
                </Route>
              )
            )}
          />
        </ServiceProvider>
      </ThemeProvider>
    </NextUIProvider>
  );
}
