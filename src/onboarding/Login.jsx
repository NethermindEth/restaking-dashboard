import { Button, Input } from '@nextui-org/react';
import { useSignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { reduceState } from '../shared/helpers';
import { useForm } from 'react-hook-form';
import { useMutativeReducer } from 'use-mutative';

export default function Login() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm();

  const { isLoaded: isClerkLoaded, signIn, setActive } = useSignIn();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    isLoading: false
  });

  const handleLogin = async data => {
    if (!isClerkLoaded) {
      return;
    }
    try {
      dispatch({ isLoading: true });
      const signInAttempt = await signIn.create({
        identifier: data.email,
        password: data.password
      });
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      err.errors.forEach(e => {
        if (e.meta.paramName === 'identifier') {
          setError('email', {
            message: e.message
          });
        }
        if (e.meta.paramName === 'password') {
          setError('password', {
            message: e.message
          });
        }
      });
    } finally {
      dispatch({ isLoading: false });
    }
  };

  // const handleGoogleLogin = async () => {
  //   await signIn.authenticateWithRedirect({
  //     strategy: 'oauth_google',
  //     redirectUrl:
  //       'https://hip-primate-84.clerk.accounts.dev/v1/oauth_callback',
  //     redirectUrlComplete: '/'
  //   });
  // };

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

      {/* <GoogleOneTap /> */}

      <form
        className="flex w-full flex-col items-center justify-center gap-y-5 rounded-lg border border-outline bg-content1 p-5 md:w-[31rem]"
        onSubmit={handleSubmit(handleLogin)}
      >
        <p className="font-display text-3xl text-foreground-1">
          Log In to your account
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

        {/* <div className="flex w-full items-center gap-x-2">
          <Divider className="w-[46.5%] bg-outline" />
          <p>or</p>
          <Divider className="w-[46.5%] bg-outline" />
        </div> */}
        {/* <Button
          className="rounded-sm border border-outline"
          fullWidth
          onPress={handleGoogleLogin}
          startContent={<Image src="/images/google.svg" />}
          variant="bordered"
        >
          Continue with Google
        </Button> */}

        <Button
          className="rounded-sm border border-secondary text-secondary hover:border-focus hover:text-focus"
          fullWidth
          isLoading={state.isLoading}
          type="submit"
          variant="bordered"
        >
          Login
        </Button>

        <div className="text-center">
          <p className="mb-2 text-foreground-2">Don't have an account?</p>
          <Link
            className="cursor-pointer text-foreground-1 hover:underline"
            to={'/register'}
          >
            Create account
          </Link>
        </div>
      </form>
    </div>
  );
}
