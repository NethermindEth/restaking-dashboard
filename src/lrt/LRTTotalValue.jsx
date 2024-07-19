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
      <div className="bg-content1 border border-outline flex flex-row items-center justify-between mb-4 p-4 rounded-lg">
        <div className="basis-1/2 border-r border-outline flex flex-col gap-2 items-center">
          <div className="text-foreground-2 text-sm">TVL</div>
          {isLoadingDelegations && (
            <Skeleton
              classNames={{ base: 'h-4 w-20 rounded-md border-none' }}
            />
          )}
          {!isLoadingDelegations && (
            <div className="text-center">
              <div className="text-foreground-1 text-sm">
                {formatUSD(delegations?.total * delegations?.rate)}
              </div>
              <div className="text-foreground-2 text-xs">
                {formatETH(delegations?.total)}
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
              classNames={{ base: 'h-4 w-20 rounded-md border-none' }}
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
