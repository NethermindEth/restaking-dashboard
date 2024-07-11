import { formatIntETH, formatIntUSD } from '../shared/formatters';
import { Skeleton } from '@nextui-org/react';

export default function LRTTotalValue({
  delegations,
  isLoadingDelegations,
  isLoadingTVL,
  tvl
}) {
  return (
    <>
      <div className="bg-content1 border border-outline flex flex-row items-center justify-between mb-4 p-4 rounded-lg">
        <div className="basis-1/2 border-r border-outline flex flex-col gap-2 items-center">
          <div className="text-foreground-2 text-sm">TVL</div>
          {isLoadingDelegations && (
            <Skeleton
              classNames={{ base: 'border-none h-4 rounded-md w-20' }}
            />
          )}
          {!isLoadingDelegations && (
            <div className="text-center">
              <div className="text-foreground-1 text-sm">
                {formatIntUSD(delegations?.total * delegations?.rate)}
              </div>
              <div className="text-foreground-2 text-xs">
                {formatIntETH(delegations?.total)}
              </div>
            </div>
          )}
        </div>
        <div className="basis-1/2 flex flex-col gap-2 items-center">
          <div className="text-foreground-2 text-sm">
            Percentage on EigenLayer
          </div>
          {(isLoadingTVL || isLoadingDelegations) && (
            <Skeleton
              classNames={{ base: 'border-none h-4 rounded-md w-20' }}
            />
          )}
          {!isLoadingTVL && !isLoadingDelegations && (
            <div className="text-foreground-1 text-sm">
              {Math.round((delegations?.total * 100) / tvl)}%
            </div>
          )}
        </div>
      </div>
    </>
  );
}
