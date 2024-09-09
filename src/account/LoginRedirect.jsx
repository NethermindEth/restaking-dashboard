import { RedirectToSignIn } from '@clerk/clerk-react';
import { Spinner } from '@nextui-org/react';

export default function LoginRedirect() {
  return (
    <div className="flex h-full flex-col content-center justify-center">
      <Spinner color="primary" size="lg" />
      <RedirectToSignIn />
    </div>
  );
}
