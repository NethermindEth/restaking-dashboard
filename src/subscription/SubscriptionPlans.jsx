import { Button } from '@nextui-org/react';
import { useAuth } from '@clerk/clerk-react';

export default function SubscriptionPlans() {
  const { isSignedIn } = useAuth();

  const handleSubscribe = () => {
    if (!isSignedIn) {
      // TODO: navigate to login page
    }
  };

  return (
    <div className="mx-auto flex w-full flex-col items-center justify-center gap-y-3">
      <div className="font-display text-3xl font-medium text-foreground-1">
        Support plans
      </div>
      <div>
        <div className="text-center text-sm text-foreground-2">
          Support the development of our dashboard sp we can continue adding
          more amazing features to help the restaking community
        </div>
      </div>{' '}
      <div className="mt-4 flex w-full flex-col gap-6 sm:flex-row md:w-72">
        <div className="rd-box flex w-full flex-col items-center justify-center gap-x-6 gap-y-4 p-4 sm:h-72">
          <div className="text-2xl text-foreground-1">Monthly Plan</div>
          <div className="gap-x-1 font-display text-xl text-foreground-1">
            $1.99/month
          </div>

          <FeatureItem
            description="Hide promotions throughout the dashboard"
            heading=""
          />
          <FeatureItem
            description="Renews monthly, cancel anytime"
            heading=""
          />

          <Button
            className="h-12 w-full bg-focus text-black"
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
      <div className="text-foreground-2">{heading}</div>
      <div className="text-foreground-1">{description}</div>
    </div>
  );
}
