import { Button } from '@nextui-org/react';
import { reduceState } from '../shared/helpers';
import { useAuth } from '@clerk/clerk-react';
import { useMutativeReducer } from 'use-mutative';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../@services/ServiceContext';

export default function SubscriptionPlans() {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const { subscriptionService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    isError: false
  });

  const handleSubscribe = async () => {
    if (!isSignedIn) {
      navigate('/login');
    }
    try {
      dispatch({ isError: false });
      const res = await subscriptionService.getPaymentLink('monthly_support');
      window.location.href = res.paymentlink;
    } catch {
      dispatch({ isError: true });
    }
  };

  return (
    <div className="mx-auto flex w-full flex-col items-center justify-center gap-y-3">
      <div className="font-display text-3xl font-medium text-foreground-1">
        Support plans
      </div>
      <div>
        <div className="w-full text-center text-foreground-2 md:w-[40rem]">
          Support the development of our dashboard so we can continue adding
          more amazing features to help the restaking community
        </div>
      </div>{' '}
      <div className="mt-4 flex w-full flex-col gap-6 sm:flex-row">
        <div className="flex w-full flex-col items-center justify-center gap-x-6 gap-y-4 p-4 sm:h-80">
          <div className="gap-x-1 font-display text-3xl text-foreground-1">
            $1.99/month
          </div>

          <FeatureItem
            description="Hide promotions throughout the dashboard"
            heading="Hide promotions"
          />
          <FeatureItem
            description="Cancel it at anytime"
            heading="Renews monthly"
          />

          {state.isError && (
            <p className="text-error-800">
              Some error occured. Please try again later
            </p>
          )}
          <Button
            className="mt-4 h-12 w-44 border-secondary text-secondary hover:border-focus hover:text-focus"
            onPress={handleSubscribe}
            radius="sm"
            variant="bordered"
          >
            Support us
          </Button>
        </div>
      </div>
    </div>
  );
}

export function FeatureItem({ heading, description }) {
  return (
    <div className="text-center">
      <div className="text-foreground-1">{heading}</div>
      <div className="text-foreground-2">{description}</div>
    </div>
  );
}
