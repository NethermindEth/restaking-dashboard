import { formatETH, formatUSD } from '../shared/formatters';
import { Skeleton } from '@nextui-org/react';

export default function LRTTotalValue({
  delegations,
  isLoadingDelegations,
  isLoadingTVL,
  tvl
}) {
  return (
    <>
      <div className="mb-4 flex flex-row items-center justify-between rounded-lg border border-outline bg-content1 p-4">
        <div className="flex basis-1/2 flex-col items-center gap-2 border-r border-outline">
          <div className="text-sm text-foreground-2">TVL</div>
          {isLoadingDelegations && (
            <Skeleton
              classNames={{ base: 'border-none h-4 rounded-md w-20' }}
            />
          )}
          {!isLoadingDelegations && (
            <div className="text-center">
              <div className="text-sm text-foreground-1">
                {formatUSD(delegations?.total * delegations?.rate)}
              </div>
              <div className="text-xs text-foreground-2">
                {formatETH(delegations?.total)}
              </div>
            </div>
          )}
        </div>
        <div className="flex basis-1/2 flex-col items-center gap-2">
          <div className="text-sm text-foreground-2">
            Percentage on EigenLayer
          </div>
          {(isLoadingTVL || isLoadingDelegations) && (
            <Skeleton
              classNames={{ base: 'border-none h-4 rounded-md w-20' }}
            />
          )}
          {!isLoadingTVL && !isLoadingDelegations && (
            <div className="text-sm text-foreground-1">
              {Math.round((delegations?.total * 100) / tvl)}%
            </div>
          )}
        </div>
      </div>
    </>
  );
}
