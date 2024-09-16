import { Link } from 'react-router-dom';
import { SignUp } from '@clerk/clerk-react';

export default function Register() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-y-9">
      <div className="flex flex-col gap-y-4 text-center">
        <h1 className="font-display text-3xl font-normal text-foreground-1">
          Register
        </h1>
        <p className="text-foreground-2">
          Lets create your account or if you have one already, sign up
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border border-outline bg-content1">
        <SignUp
          appearance={{
            layout: {
              socialButtonsPlacement: 'bottom'
            },
            elements: {
              rootBox: 'lg:w-[500px]',
              cardBox: 'lg:w-[500px]',
              card: 'bg-content1 px-5',
              headerTitle:
                'text-foreground-1 text-3xl font-display font-normal',
              headerSubtitle: 'hidden',
              socialButtons: 'border rounded-md border-outline py-2',
              socialButtonsBlockButtonText__google: 'text-foreground-2',
              dividerLine: 'bg-outline',
              formFieldLabel: 'text-foreground-1',
              formFieldInput:
                'bg-transparent !border !border-outline text-white px-4 py-4',
              formFieldInputShowPasswordButton: 'text-foreground-2',
              formButtonPrimary:
                'bg-transparent text-secondary after:!bg-none after:border py-3 after:border-secondary hover:bg-content1 hover:border hover:border-secondary',
              footer: 'hidden',
              footerAction: 'bg-content1',
              otpCodeFieldInput: '!border !border-outline text-white',
              formResendCodeLink: 'text-foreground-2',
              backLink: 'text-foreground-2'
            }
          }}
        />
        <p className="text-foreground-2">Already have an account?</p>
        <Link
          className="mb-7 cursor-pointer text-foreground-1 hover:underline"
          to={'/login'}
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
