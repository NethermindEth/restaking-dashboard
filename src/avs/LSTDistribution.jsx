import React from 'react';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';
import { formatNumber } from '../utils';
import { Card, cn } from '@nextui-org/react';
import LSTTreeMap from './LSTTreeMap';

export default function LSTDistribution({
  totalEthDistributionData,
  lstDistributionData
}) {
  const compact = !useTailwindBreakpoint('md');
  return (
    <div className="w-full flex md:flex-row flex-col items-start justify-between gap-4 relative">
      <div className="space-y-4 w-full">
        <Card
          radius="md"
          className="bg-content1 border border-outline space-y-4 p-4"
        >
          <div className="font-light text-base text-foreground-1">
            Total ETH distribution
          </div>

          <div>
            <div>
              {totalEthDistributionData.map((lst, i) => (
                <div
                  key={`lst-item-${i}`}
                  className={cn(
                    i !== 0 && 'border-t',
                    `border-outline flex flex-row gap-x-2 justify-between items-center p-4 hover:bg-default`
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="bg-center bg-contain bg-no-repeat h-5 rounded-full min-w-5"
                        style={{
                          backgroundImage: `url('https://w7.pngwing.com/pngs/268/1013/png-transparent-ethereum-eth-hd-logo-thumbnail.png')`
                        }}
                      />
                      {lst.name && (
                        <span className="text-foreground-2">{lst.name}</span>
                      )}
                    </div>
                    {lst.token && (
                      <span className="text-foreground-active">
                        {lst.token}
                      </span>
                    )}
                    {lst.tvlPercentage && (
                      <span className="text-foreground-active">
                        {lst.tvlPercentage} %
                      </span>
                    )}
                  </div>
                  <div className="font-light">
                    <div className="text-base flex items-center gap-2">
                      {formatNumber(lst.tvl, compact)} ETH
                    </div>
                    <div className="text-foreground-2 text-xs text-end">
                      $ {formatNumber(lst.tvl, compact)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card
          radius="md"
          className="bg-content1 border border-outline w-full space-y-4 p-4"
        >
          <div className="font-light text-base text-foreground-1">
            LST distribution
          </div>

          <div>
            {lstDistributionData.map((lst, i) => (
              <div
                key={`lst-item-${i}`}
                className={cn(
                  i !== 0 && 'border-t',
                  `border-outline flex flex-row gap-x-2 justify-between items-center p-4 hover:bg-default`
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="bg-center bg-contain bg-no-repeat h-5 rounded-full min-w-5"
                      style={{
                        backgroundImage: `url('https://w7.pngwing.com/pngs/268/1013/png-transparent-ethereum-eth-hd-logo-thumbnail.png')`
                      }}
                    />
                    <span className="text-foreground-2">{lst.name}</span>
                  </div>
                  <span className="text-foreground-active">{lst.token}</span>
                </div>
                <div className="font-light">
                  <div className="text-base flex items-center gap-2">
                    {formatNumber(lst.tvl, compact)} ETH
                  </div>
                  <div className="text-foreground-2 text-xs text-end">
                    $ {formatNumber(lst.tvl, compact)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="flex flex-col gap-4 justify-between items-end w-full md:sticky top-4">
        <LSTTreeMap
          height={500}
          totalEthDistributionData={totalEthDistributionData}
          lstDistributionData={lstDistributionData}
        />
      </div>
    </div>
  );
}
