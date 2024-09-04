import { Button, Divider, Tab, Tabs } from '@nextui-org/react';

export default function SubscriptionPlans() {
  return (
    <div className="flex flex-col items-center justify-center gap-y-3">
      <div className="font-display text-3xl font-medium text-foreground-1">
        Subscription plans
      </div>
      <div>
        <div className="text-center text-sm text-foreground-2">
          Select the PRO plan for unleash the full potential and all the
          features that we have prepared for you.
        </div>
        <div className="text-center text-sm text-foreground-2">
          Save up to 50% with our early bird plan.
        </div>
      </div>
      <Tabs
        className="my-4"
        classNames={{
          cursor: 'rounded border border-outline shadow-none',
          panel: 'p-0',
          tab: 'h-fit p-2',
          tabList: 'rd-box w-full !overflow-x-scroll p-1'
        }}
        radius="sm"
        size="md"
      >
        <Tab key="monthly" title="Monthly">
          {' '}
          <div className="flex w-full flex-col gap-6 sm:flex-row">
            <div className="rd-box flex w-full flex-col items-center justify-center gap-x-6 gap-y-4 p-4 sm:h-80">
              <div className="text-foreground-1">Basic PLAN (FREE)</div>
              <FeatureItem
                description="Discord"
                heading="Community support on discord"
              />
              <div className="flex w-full items-center gap-x-3">
                <Divider className="flex-1" />
                <div className="flex-1 whitespace-nowrap text-foreground-2">
                  Coming soon
                </div>
                <Divider className="flex-1" />
              </div>
              <FeatureItem description="1000 calls" heading="Monthly Calls" />

              <Button
                className="h-12 w-full border border-foreground-2 text-foreground-2"
                radius="sm"
                variant="bordered"
              >
                Try for free
              </Button>
            </div>

            <div className="rd-box flex w-full flex-col items-center justify-center gap-x-6 gap-y-4 p-4">
              <div className="font-display text-foreground-1">PRO PLAN</div>
              <div className="gap-x-1 font-display text-xl text-foreground-1">
                <span className="text-foreground-2 line-through">$1200</span> -
                $600
              </div>
              <FeatureItem
                description="Premium features"
                heading="Lock in an early-bird rate for"
              />
              <FeatureItem
                description="Telegram - Discord"
                heading="Community support on"
              />
              <FeatureItem
                description="SAVE $600"
                heading="50% off for 1 year - $600 Annual"
              />
              <div className="flex w-full items-center gap-x-3">
                <Divider className="flex-1" />
                <div className="flex-1 whitespace-nowrap text-foreground-2">
                  Coming soon
                </div>
                <Divider className="flex-1" />
              </div>
              <FeatureItem description="10,000 calls" heading="Monthly Calls" />
              <FeatureItem
                description="$0.0012"
                heading="Overages per call at"
              />
              <FeatureItem
                description="100 free per month"
                heading="Webhook triggers "
              />
              <Button className="h-12 w-full bg-focus text-black" radius="sm">
                Upgrade plan
              </Button>
            </div>
          </div>
        </Tab>
        <Tab key="yearly" title="Yearly">
          <div className="flex w-full flex-col gap-6 sm:flex-row">
            <div className="rd-box flex w-full flex-col items-center justify-center gap-x-6 gap-y-4 p-4 sm:h-80">
              <div className="text-foreground-1">Basic PLAN (FREE)</div>
              <FeatureItem
                description="Discord"
                heading="Community support on discord"
              />
              <div className="flex w-full items-center gap-x-3">
                <Divider className="flex-1" />
                <div className="flex-1 whitespace-nowrap text-foreground-2">
                  Coming soon
                </div>
                <Divider className="flex-1" />
              </div>
              <FeatureItem description="1000 calls" heading="Monthly Calls" />

              <Button
                className="h-12 w-full border border-foreground-2 text-foreground-2"
                radius="sm"
                variant="bordered"
              >
                Try for free
              </Button>
            </div>

            <div className="rd-box flex w-full flex-col items-center justify-center gap-x-6 gap-y-4 p-4">
              <div className="font-display text-foreground-1">PRO PLAN</div>
              <div className="gap-x-1 font-display text-xl text-foreground-1">
                <span className="text-foreground-2 line-through">$1200</span> -
                $600
              </div>
              <FeatureItem
                description="Premium features"
                heading="Lock in an early-bird rate for"
              />
              <FeatureItem
                description="Telegram - Discord"
                heading="Community support on"
              />
              <FeatureItem
                description="SAVE $600"
                heading="50% off for 1 year - $600 Annual"
              />
              <div className="flex w-full items-center gap-x-3">
                <Divider className="flex-1" />
                <div className="flex-1 whitespace-nowrap text-foreground-2">
                  Coming soon
                </div>
                <Divider className="flex-1" />
              </div>
              <FeatureItem description="10,000 calls" heading="Monthly Calls" />
              <FeatureItem
                description="$0.0012"
                heading="Overages per call at"
              />
              <FeatureItem
                description="100 free per month"
                heading="Webhook triggers "
              />
              <Button className="h-12 w-full bg-focus text-black" radius="sm">
                Upgrade plan
              </Button>
            </div>
          </div>
        </Tab>
      </Tabs>
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
