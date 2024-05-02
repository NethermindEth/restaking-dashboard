import { Card, CardBody, CardHeader, Tab, Tabs } from '@nextui-org/react';
import LRTDistribution from './LRTDistribution';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';

export default function Home() {
  const useRoundCorners = useTailwindBreakpoint('md');

  return (
    <>
      <Tabs className="mb-2 w-full" variant="underlined">
        <Tab key="lrt" title="LRT distribution" />
        <Tab key="avs" title="AVS" />
        <Tab key="deposits" title="Deposits" />
        <Tab key="withdrawals" title="Withdrawals" />
        <Tab key="eigenpods" title="EigenPods" />
      </Tabs>
      <div>
        <Card
          className="bg-white/50 dark:bg-white/10"
          shadow="md"
          radius={useRoundCorners ? 'lg' : 'none'}
        >
          {/* <CardHeader></CardHeader> */}
          <CardBody>
            <LRTDistribution height={512} />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
