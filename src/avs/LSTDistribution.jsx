import React from 'react';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';
import { formatNumber } from '../utils';
import { Card, cn, Tooltip } from '@nextui-org/react';
import LSTTreeMap from './LSTTreeMap';
import { useState } from 'react';

function EigenDisclaimer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="inline-flex gap-x-1">
      N/A
      <Tooltip
        showArrow={true}
        placement="top"
        color="bg-black/75"
        content={
          <div className="max-w-[250px]">
            <div className="text-sm">
              EIGEN is currently not listed on any exchanges so we are unable to
              get its USD value. Information will be updated when the token is
              available on centralized/decentralized exchanges.
            </div>
          </div>
        }
        isOpen={isOpen}
      >
        <span
          className="material-symbols-outlined text-base"
          style={{
            fontVariationSettings: `'FILL' 0`
          }}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          onPress={() => setIsOpen(!isOpen)}
        >
          info
        </span>
      </Tooltip>
    </div>
  );
}

export default function LSTDistribution({
  totalEthDistributionData,
  lstDistributionData,
  rate
}) {
  const compact = !useTailwindBreakpoint('md');

  return (
    <div className="relative flex w-full flex-col items-start justify-between gap-4 md:flex-row">
      <div className="w-full space-y-4">
        <Card
          radius="md"
          className="space-y-4 border border-outline bg-content1 p-4"
        >
          <div className="text-base font-light text-foreground-1">
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
                    `flex flex-row items-center justify-between gap-x-2 border-outline p-4 hover:bg-default`
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
                      {lst.token !== 'EIGEN' ? (
                        `$${formatNumber(lst.tvl * rate, compact)}`
                      ) : (
                        <EigenDisclaimer />
                      )}
                    </div>
                    <div className="text-end text-sm text-subtitle">
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
          className="w-full space-y-4 border border-outline bg-content1 p-4"
        >
          <div className="text-base font-light text-foreground-1">
            LST distribution
          </div>

          <div>
            {lstDistributionData.map((lst, i) => (
              <div
                key={`lst-item-${i}`}
                className={cn(
                  i !== 0 && 'border-t',
                  `flex flex-row items-center justify-between gap-x-2 border-outline p-4 hover:bg-default`
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
      <div className="top-4 flex w-full flex-col items-end justify-between gap-4 md:sticky">
        <LSTTreeMap
          height={500}
          totalEthDistributionData={totalEthDistributionData}
          lstDistributionData={lstDistributionData}
        />
      </div>
    </div>
  );
}
