import { Link } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';

export default function Login() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-y-9">
      <div className="flex flex-col gap-y-4 text-center">
        <h1 className="font-display text-3xl font-normal text-foreground-1">
          Login
        </h1>
        <p className="text-foreground-2">
          Let's sign in to your account or if you don't have one, sign up
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border border-outline bg-content1">
        <SignIn
          appearance={{
            layout: {
              socialButtonsPlacement: 'bottom'
            },
            elements: {
              rootBox: 'lg:w-[31rem]',
              cardBox: 'lg:w-[31rem]',
              card: 'bg-content1 px-5',
              headerTitle:
                'text-foreground-1 text-3xl font-display font-normal',
              headerSubtitle: 'hidden',
              socialButtons: 'border rounded-md border-outline py-2',
              socialButtonsBlockButtonText__google: 'text-foreground-2',
              dividerLine: 'bg-outline',
              formFieldLabel: 'text-foreground-1',
              formFieldInput:
                'bg-transparent !border !border-outline text-white px-4 py-4 focus:!border-foreground-1',
              formFieldInputShowPasswordButton: 'text-foreground-2',
              formButtonPrimary:
                '!border bg-transparent text-secondary after:!bg-none after:border py-3 after:border-secondary hover:bg-content1 hover:border hover:border-focus hover:text-focus',
              footer: 'hidden',
              footerAction: 'bg-content1',
              otpCodeFieldInput: '!border !border-outline text-white',
              formResendCodeLink: 'text-foreground-2',
              backLink: 'text-foreground-2'
            }
          }}
        />
        <p className="mb-2 text-foreground-2">Don't have an account?</p>
        <Link
          className="mb-7 cursor-pointer text-foreground-1 hover:underline"
          to={'/register'}
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
