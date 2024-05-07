import { Button, Link, Tab, Tabs } from '@nextui-org/react';
import assets from '../shared/assets';
import { formatEther } from 'ethers';

export default function AVSDetails({ avs }) {
  return (
    <div className="basis-1/2 border-s px-4 w-full">
      <div className="flex flex-row gap-x-2 items-center">
        <div
          className="bg-contain bg-no-repeat h-8 rounded-full min-w-8"
          style={{ backgroundImage: `url('${avs.metadata.logo}')` }}
        ></div>
        <span className="basis-full font-bold text-lg truncate">
          {avs.metadata.name}
        </span>
      </div>
      <div className="flex flex-row gap-x-1 mt-4">
        <Button
          as={Link}
          href={`https://etherscan.io/address/${avs.address}`}
          target="_blank"
          showAnchorIcon
          size="sm"
          variant="flat"
        >{`${avs.address.slice(0, 6)}...${avs.address.slice(-4)}`}</Button>
        <Button
          as={Link}
          href={avs.metadata.twitter}
          target="_blank"
          showAnchorIcon
          size="sm"
          variant="flat"
        >
          @
          {avs.metadata.twitter.substring(
            avs.metadata.twitter.lastIndexOf('/') + 1
          )}
        </Button>
        <Button
          as={Link}
          href={avs.metadata.website}
          target="_blank"
          showAnchorIcon
          size="sm"
          variant="flat"
        >
          Website
        </Button>
      </div>
      <div className="py-4 text-sm">{avs.metadata.description}</div>
      <Tabs
        className="w-full"
        classNames={{
          tab: 'px-6 py-8',
          tabList: 'bg-content1 w-full'
        }}
        disabledKeys={['stakers']}
      >
        <Tab
          key="assets"
          title={
            <div className="text-center">
              <div>Assets</div>
              <div className="font-bold">
                {assetFormatter.format(formatEther(avs.tvl))}
              </div>
            </div>
          }
        >
          <div>
            {Object.entries(avs.strategies)
              .sort(compareStrategies)
              .map(([strategy, value], i) => (
                <div
                  key={`strategy-item-${i}`}
                  className="border-b flex flex-row gap-x-1 items-center py-1.5 text-sm"
                >
                  <div>{assets[strategy].name}</div>
                  <div className="bg-default px-1 py-0.5 rounded text-xs">
                    {assets[strategy].symbol}
                  </div>
                  <div className="grow text-end">
                    {assetFormatter.format(formatEther(value))}
                  </div>
                </div>
              ))}
          </div>
        </Tab>
        <Tab
          key="operators"
          title={
            <div className="text-center">
              <div>Operators</div>
              <div className="font-bold">{avs.operators}</div>
            </div>
          }
        />
        <Tab
          key="stakers"
          disabled
          title={
            <div className="text-center">
              <div>Stakers</div>
              <div className="font-bold">{avs.stakers}</div>
            </div>
          }
        />
      </Tabs>
    </div>
  );
}

const assetFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2
});
const compareStrategies = ([, i1], [, i2]) => {
  if (i1 < i2) {
    return 1;
  }

  if (i1 > i2) {
    return -1;
  }

  return 0;
};
