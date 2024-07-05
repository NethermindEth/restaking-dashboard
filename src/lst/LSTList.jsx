import React from 'react';
import { formatNumber } from '../utils';
import { STRATEGY_ASSET_MAPPING } from './helpers';
import { Skeleton } from '@nextui-org/react';

export default function LSTList({ data, latestRate, isLoading }) {
  return (
    <div>
      <div className="bg-content1 border border-outline rounded-lg text-sm mt-4 py-1">
        <div className="flex flex-row gap-x-2 items-center text-foreground-1 p-4">
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
                  key={`lst-item-${i}`}
                  className="border-t border-outline flex flex-row gap-x-2 justify-between items-center cursor-pointer hover:bg-default bg-content1 p-4"
                >
                  <div className="min-w-5">{i + 1}</div>
                  <div
                    className="bg-center bg-contain bg-no-repeat h-5 rounded-full min-w-5"
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
          key={i}
          className="p-4 flex justify-normal gap-4 md:gap-8 text-foreground-1 border-t border-outline w-full"
        >
          <div className="md:w-10/12 w-6/12">
            <Skeleton className="h-6 rounded-md w-4/5 md:w-2/3 dark:bg-default" />
          </div>
          <div className="pl-5 flex justify-between gap-5 w-10/12">
            <div className="w-3/12">
              <Skeleton className="h-6 rounded-md w-full bg-default dark:bg-default" />
            </div>
            <div className="w-3/12">
              <Skeleton className="h-6 rounded-md w-full bg-default dark:bg-default" />
            </div>
            <div className="w-3/12">
              <Skeleton className="h-6 rounded-md w-full bg-default dark:bg-default" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
