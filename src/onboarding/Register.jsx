import { Button, Checkbox, cn, Divider, Image, Input } from '@nextui-org/react';
import { GoogleOneTap, useSignUp } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { OTPInput } from 'input-otp';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

export default function Register() {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors }
  } = useForm();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async data => {
    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password
      });

      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code'
      });

      setVerifying(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const handleVerify = async e => {
    e.preventDefault();

    if (!isLoaded) return;
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code
      });
      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        navigate('/');
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err) {
      console.error('Error:', JSON.stringify(err, null, 2));
    }
  };

  const handleGoogleLogin = async () => {
    await signUp.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl:
        'https://hip-primate-84.clerk.accounts.dev/v1/oauth_callback',
      redirectUrlComplete: '/'
    });
  };

  if (verifying) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-y-9">
        <div className="flex flex-col gap-y-4 text-center">
          <h1 className="font-display text-3xl font-normal text-foreground-1">
            Register
          </h1>
          <p className="text-foreground-2">
            Let's create your account or if you have one already, sign in
          </p>
        </div>
        <form
          className="flex w-full flex-col items-center justify-center gap-y-5 rounded-lg border border-outline bg-content1 p-5 md:w-[31rem]"
          onSubmit={handleVerify}
        >
          <p className="font-display text-3xl text-foreground-1">
            Verify your email
          </p>
          <p className="font-display text-sm text-foreground-2">
            {getValues('email')}
          </p>

          <OTPInput
            containerClassName="group flex w-[20rem] items-center has-[:disabled]:opacity-30"
            maxLength={6}
            minLength={6}
            onChange={e => setCode(e)}
            render={({ slots }) => (
              <>
                <div className="flex w-full justify-between">
                  {slots.map((slot, i) => (
                    <Slot key={i} {...slot} />
                  ))}
                </div>
              </>
            )}
            required
            value={code}
          />

          <Button
            className="rounded-sm border border-secondary text-secondary hover:border-focus hover:text-focus"
            fullWidth
            type="submit"
            variant="bordered"
          >
            Submit
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-y-9">
      <div className="flex flex-col gap-y-4 text-center">
        <h1 className="font-display text-3xl font-normal text-foreground-1">
          Register
        </h1>
        <p className="text-foreground-2">
          Let's create your account or if you have one already, sign in
        </p>
      </div>

      <GoogleOneTap />

      <form
        className="flex w-full flex-col items-center justify-center gap-y-5 rounded-lg border border-outline bg-content1 p-5 md:w-[31rem]"
        onSubmit={handleSubmit(handleSignUp)}
      >
        <p className="font-display text-3xl text-foreground-1">
          Create your account
        </p>

        <Input
          classNames={{
            inputWrapper: 'rounded-sm border border-outline bg-content1',
            label: 'text-foreground-1',
            input: 'placeholder:text-foreground-2'
          }}
          errorMessage={errors.email?.message}
          isInvalid={!!errors.email}
          label="Email"
          name="email"
          placeholder="Enter your email"
          size="sm"
          variant="bordered"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
              message: 'Enter a valid email'
            }
          })}
        />

        <Input
          classNames={{
            inputWrapper: 'rounded-sm border border-outline bg-content1',
            label: 'text-foreground-1',
            input: 'placeholder:text-foreground-2'
          }}
          errorMessage={errors.password?.message}
          isInvalid={!!errors.password}
          label="Password"
          name="password"
          placeholder="Enter your password"
          size="sm"
          type="password"
          variant="bordered"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must contain 8 characters'
            }
          })}
        />

        <div className="flex w-full items-center gap-x-2">
          <Divider className="w-[46.5%] bg-outline" />
          <p>or</p>
          <Divider className="w-[46.5%] bg-outline" />
        </div>

        <Button
          className="rounded-sm border border-outline"
          fullWidth
          onPress={handleGoogleLogin}
          startContent={<Image src="/images/google.svg" />}
          variant="bordered"
        >
          Continue with Google
        </Button>

        <div className="flex w-full flex-col">
          <Checkbox
            color="warning"
            name="terms"
            size="sm"
            {...register('terms', {
              required: 'Please accept terms and conditions'
            })}
          >
            Accept Terms & conditions
          </Checkbox>
          <p className="text-xs text-danger-400">
            {errors?.terms && errors.terms.message}
          </p>
        </div>

        <Button
          className="rounded-sm border border-secondary text-secondary hover:border-focus hover:text-focus"
          fullWidth
          type="submit"
          variant="bordered"
        >
          Create account
        </Button>

        <div className="text-center">
          <p className="mb-2 text-foreground-2">Already have an account?</p>
          <Link
            className="cursor-pointer text-foreground-1 hover:underline"
            to={'/login'}
          >
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
}

function Slot(props) {
  return (
    <div
      className={cn(
        'relative size-10 text-sm',
        'flex items-center justify-center',
        'transition-all duration-300',
        'rounded-md border border-outline',
        'outline-accent-foreground/20 outline outline-0',
        { 'outline-2 outline-foreground-1': props.isActive }
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
      {props.hasFakeCaret && <FakeCaret />}
    </div>
  );
}

function FakeCaret() {
  return (
    <div className="animate-caret-blink pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="h-4 w-px bg-white" />
    </div>
  );
}
