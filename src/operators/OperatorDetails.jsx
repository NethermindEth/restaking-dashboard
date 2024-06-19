import { Card, CardBody, Divider } from '@nextui-org/react';
import React from 'react';

const OperatorDetails = () => {
  return (
    <div className="w-full">
      <Card
        radius="md"
        className="bg-content1 border border-outline w-full space-y-4"
      >
        <CardBody>
          <span className="text-foreground-1 text-sm">Back</span>
          <div className="flex justify-between mt-8">
            <span className="text-foreground-1 text-xl ml-8">P2P.org</span>
          </div>

          <div className="w-full h-20 flex rounded-lg border mt-6 border-outline px-10 py-4 justify-between ">
            <div className="flex basis-1/4 flex-col gap-y-2">
              <span className="text-foreground-1 text-sm">TVL</span>
              <span>34,554,567 ETH</span>
            </div>
            <Divider orientation="vertical" className="bg-outline" />
            <div className="flex basis-1/6 flex-col gap-y-2">
              <span className="text-foreground-1 text-sm">AVS Subscribed</span>
              <span>23</span>
            </div>
            <Divider orientation="vertical" className="bg-outline" />
            <div className="flex basis-2/12 flex-col gap-y-2">
              <span className="text-foreground-1 text-sm">Stakers</span>
              <span>4,456</span>
            </div>
            <Divider orientation="vertical" className="bg-outline" />
            <div className="flex basis-1/12 flex-col gap-y-2">
              <span className="text-foreground-1 text-sm">Uptime</span>
              <span>88%</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default OperatorDetails;
