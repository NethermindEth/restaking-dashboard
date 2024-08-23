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
import OperatorList from './operators/OperatorList';
import { ServiceProvider } from './@services/ServiceContext';
import { ThemeProvider } from './shared/ThemeContext';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />} path="/">
      <Route element={<Home />} index />
      <Route element={<AVSList />} path="/avs" />
      <Route element={<AVSDetails />} path="/avs/:address/:tab?" />
      <Route element={<LRT />} path="/lrt" />
      <Route element={<OperatorList />} path="/operators" />
      <Route element={<OperatorDetails />} path="/operators/:address/:tab?" />
      <Route element={<LST />} path="/lst" />
      <Route element={<NotFound />} path="*" />
    </Route>
  )
);

export default function App() {
  log.debug('Starting up');

  return (
    <NextUIProvider navigate={router.navigate}>
      <ThemeProvider>
        <ServiceProvider>
          <RouterProvider router={router} />
        </ServiceProvider>
      </ThemeProvider>
    </NextUIProvider>
  );
}
