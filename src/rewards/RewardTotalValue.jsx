import { formatEther, getBigInt } from 'ethers';
import ErrorMessage from '../shared/ErrorMessage';
import { formatUSD } from '../shared/formatters';
import { Skeleton } from '@nextui-org/react';
import { useTailwindBreakpoint } from '../shared/hooks/useTailwindBreakpoint';

export default function RewardTotalValue({
  rewardsTotal,
  claimedTotal,
  isOperatorLoading,
  error,
  ethRate
}) {
  const compact = !useTailwindBreakpoint('md');

  return (
    <>
      <div className="rd-box mb-4 flex flex-row items-center justify-between p-4">
        <div className="flex basis-1/3 flex-col items-center gap-2 border-outline">
          <div className="text-foreground-2">Total rewards</div>
          {isOperatorLoading && (
            <Skeleton
              classNames={{ base: 'h-4 w-20 rounded-md border-none' }}
            />
          )}
          {!!error && <ErrorMessage message={error} />}
          {!isOperatorLoading && !error && (
            <div className="text-center">
              <div className="text-base text-foreground-1">
                {formatUSD(
                  parseFloat(formatEther(getBigInt(rewardsTotal.toString()))) *
                  ethRate,
                  compact
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex basis-1/3 flex-col items-center gap-2 border-x border-outline">
          <div className="text-center text-foreground-2">Claimed rewards</div>
          {isOperatorLoading && (
            <Skeleton
              classNames={{ base: 'h-4 w-20 rounded-md border-none' }}
            />
          )}
          {!!error && <ErrorMessage message={error} />}
          {!isOperatorLoading && !error && (
            <div className="text-center">
              <div className="text-base text-foreground-1">
                {formatUSD(
                  parseFloat(formatEther(getBigInt(claimedTotal.toString()))) *
                  ethRate,
                  compact
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex basis-1/3 flex-col items-center gap-2 ps-2">
          <div className="text-center text-foreground-2">Unclaimed rewards</div>
          {isOperatorLoading && (
            <Skeleton
              classNames={{ base: 'h-4 w-20 rounded-md border-none' }}
            />
          )}
          {!!error && <ErrorMessage message={error} />}
          {!isOperatorLoading && !error && (
            <div className="text-center">
              <div className="text-base text-foreground-1">
                {formatUSD(
                  parseFloat(
                    formatEther(
                      getBigInt((rewardsTotal - claimedTotal).toString())
                    )
                  ) * ethRate,
                  compact
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
