import LoginRedirect from '../account/LoginRedirect';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

export default function PrivateOutlet() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Outlet />;
  }

  return <LoginRedirect />;
}
