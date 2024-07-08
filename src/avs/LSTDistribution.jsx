import React from 'react';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';
import { formatNumber } from '../utils';
import { Card, cn } from '@nextui-org/react';
import LSTTreeMap from './LSTTreeMap';

export default function LSTDistribution({
  totalEthDistributionData,
  lstDistributionData,
  rate
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
            {' '}
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
                      <img src={lst.logo} className="size-5 rounded-full" />

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
                  <div className="text-end">
                    <div>
                      {lst.token !== 'EIGEN'
                        ? `$${formatNumber(lst.tvl * rate, compact)}`
                        : '-'}
                    </div>
                    <div className="text-sm text-subtitle text-end">
                      {formatNumber(lst.tvl, compact)} ETH
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
                    <img src={lst.logo} className="size-5 rounded-full" />
                    <span className="text-foreground-2">{lst.name}</span>
                  </div>
                  <span className="text-foreground-active">{lst.token}</span>
                </div>
                <div className="text-end">
                  <div>${formatNumber(lst.tvl * rate, compact)}</div>
                  <div className="text-sm text-subtitle">
                    {formatNumber(lst.tvl, compact)} ETH
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
