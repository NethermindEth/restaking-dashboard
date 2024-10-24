import './App.css';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom';
import AVSDetails from './avs/AVSDetails';
import AVSList from './avs/AVSList';
import { ClerkProvider } from '@clerk/clerk-react';
import Home from './home/Home';
import Layout from './shared/Layout';
import log from './shared/logger';
import Login from './onboarding/Login';
import LRT from './lrt/LRT';
import LST from './lst/LST';
import { NextUIProvider } from '@nextui-org/react';
import NotFound from './shared/NotFound';
import OperatorDetails from './operators/OperatorDetails';
import OperatorList from './operators/OperatorList';
import Register from './onboarding/Register';
import { ServiceProvider } from './@services/ServiceContext';
import SubscriptionPlans from './subscription/SubscriptionPlans';
import TermsConditions from './TermsConditions/TermsConditions';
import { ThemeProvider } from './shared/ThemeContext';
import ThankYou from './shared/ThankYou';

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
      <Route element={<SubscriptionPlans />} path="/subscriptions" />
      <Route element={<Login />} path="/login" />
      <Route element={<Register />} path="/register" />
      <Route element={<ThankYou />} path="/thankyou" />
      <Route element={<TermsConditions />} path="/terms-and-conditions" />
      <Route element={<NotFound />} path="*" />
    </Route>
  )
);

export default function App() {
  log.debug('Starting up');

  return (
    <NextUIProvider navigate={router.navigate}>
      <ThemeProvider>
        <ClerkProvider
          afterSignOutUrl="/"
          publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
        >
          <ServiceProvider>
            <RouterProvider router={router} />
          </ServiceProvider>
        </ClerkProvider>
      </ThemeProvider>
    </NextUIProvider>
  );
}
