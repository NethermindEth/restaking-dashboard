import './App.css';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom';
import AVSDetails from './avs/AVSDetails';
import AVSList from './avs/AVSList';
import Home from './home/Home';
import Layout from './shared/Layout';
import log from './shared/logger';
import LRT from './lrt/LRT';
import LST from './lst/LST';
import { NextUIProvider } from '@nextui-org/react';
import NotFound from './shared/NotFound';
import OperatorDetails from './operators/OperatorDetails';
import OperatorsList from './operators/OperatorsList';
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
                  <Route path="/avs" element={<AVSList />} />
                  <Route path="/avs/:address" element={<AVSDetails />} />
                  <Route path="/lrt" element={<LRT />} />
                  <Route path="/operators" element={<OperatorsList />} />
                  <Route
                    path="/operators/:address"
                    element={<OperatorDetails />}
                  />
                  <Route path="/lst" element={<LST />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              )
            )}
          />
        </ServiceProvider>
      </ThemeProvider>
    </NextUIProvider>
  );
}
