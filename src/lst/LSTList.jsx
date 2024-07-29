import React from 'react';
import { formatNumber } from '../utils';
import { STRATEGY_ASSET_MAPPING } from './helpers';
import { Skeleton } from '@nextui-org/react';

export default function LSTList({ data, latestRate, isLoading }) {
  return (
    <div>
      <div className="mt-4 rounded-lg border border-outline bg-content1 py-1 text-sm">
        <div className="flex flex-row items-center gap-x-2 p-4 text-foreground-1">
          <div className="min-w-5"></div>
          <span className="basis-full">Protocol</span>
          <span className="basis-1/2">Unbonding period</span>
          <span className="basis-1/2 text-end">Total value</span>
        </div>
        {isLoading && <LSTListSkeleton />}
        {!isLoading && (
          <div>
            {data.map(([address, tvl], i) => {
              return (
                <div
                  className="flex cursor-pointer flex-row items-center justify-between gap-x-2 border-t border-outline bg-content1 p-4 hover:bg-default"
                  key={`lst-item-${i}`}
                >
                  <div className="min-w-5">{i + 1}</div>
                  <div
                    className="h-5 min-w-5 rounded-full bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url('${STRATEGY_ASSET_MAPPING[address].logo}')`
                    }}
                  ></div>
                  <div className="basis-full truncate">
                    <span className="text-subtitle">
                      {STRATEGY_ASSET_MAPPING[address].name}
                    </span>
                    <span className="mx-1" />
                    {STRATEGY_ASSET_MAPPING[address].compact}
                  </div>
                  <div className="basis-1/2">7 days</div>
                  <div className="basis-1/2 text-end">
                    <div>${formatNumber(tvl * latestRate)}</div>
                    <div className="text-xs text-subtitle">
                      {formatNumber(tvl)} ETH
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const LSTListSkeleton = () => {
  return (
    <div>
      {[...Array(10)].map((_, i) => (
        <div
          className="flex w-full justify-normal gap-4 border-t border-outline p-4 text-foreground-1 md:gap-8"
          key={i}
        >
          <div className="w-6/12 md:w-10/12">
            <Skeleton className="h-6 w-4/5 rounded-md dark:bg-default md:w-2/3" />
          </div>
          <div className="flex w-10/12 justify-between gap-5 pl-5">
            <div className="w-3/12">
              <Skeleton className="h-6 w-full rounded-md bg-default dark:bg-default" />
            </div>
            <div className="w-3/12">
              <Skeleton className="h-6 w-full rounded-md bg-default dark:bg-default" />
            </div>
            <div className="w-3/12">
              <Skeleton className="h-6 w-full rounded-md bg-default dark:bg-default" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
