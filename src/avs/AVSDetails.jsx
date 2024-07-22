import { BEACON_STRATEGY, EIGEN_STRATEGY } from './helpers';
import { formatETH, formatNumber } from '../shared/formatters';
import { Skeleton, Tab, Tabs } from '@nextui-org/react';
import AVSDetailsHeader from './AVSDetailsHeader';
import AVSDetailsOperatorsTab from './AVSDetailsOperatorsTab';
import AVSDetailsTVLTab from './AVSDetailsTVLTab';
import { reduceState } from '../shared/helpers';
import { useEffect } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { useParams } from 'react-router-dom';
import { useServices } from '../@services/ServiceContext';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';

export default function AVSDetails() {
  const { address } = useParams();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    isAVSLoading: true,
    strategies: undefined,
    avs: undefined,
    totalTokens: {
      lst: 0,
      eth: 0,
      eigen: 0
    },
    ethRate: 1
  });
  const { avsService } = useServices();
  const compact = !useTailwindBreakpoint('lg');

  useEffect(() => {
    dispatch({ isAVSLoading: true });
    (async () => {
      const avs = await avsService.getAVSDetails(address);

      const strategies = avs.strategies.reduce((acc, strategy) => {
        acc[strategy.address] = BigInt(strategy.tokens) / BigInt(1e18);
        return acc;
      }, Object.create(null));

      const totals = { lst: 0n, eth: 0n, eigen: 0n };

      for (const strategy in strategies) {
        if (strategy === EIGEN_STRATEGY) {
          totals.eigen += strategies[strategy];
        } else if (strategy === BEACON_STRATEGY) {
          totals.eth += strategies[strategy];
        } else {
          totals.lst += strategies[strategy];
        }
      }

      totals.eigen = Number(totals.eigen);
      totals.eth = Number(totals.eth);
      totals.lst = Number(totals.lst);

      dispatch({
        avs,
        ethRate: avs.rate,
        strategies,
        totalTokens: totals,
        isAVSLoading: false
      });
    })();
  }, [address, avsService, dispatch]);

  return (
    <>
      {state.isAVSLoading ? (
        <div className="min-h-[128px] w-full rounded-lg border border-outline bg-content1 p-4">
          <div className="flex max-w-[300px] items-center">
            <Skeleton className="size-12 shrink-0 rounded-full border border-outline" />
            <Skeleton className="ml-2 h-8 w-full rounded-md" />
          </div>
          <div className="my-4">
            <Skeleton className="h-16 w-full rounded-md" />
          </div>
        </div>
      ) : (
        <AVSDetailsHeader avs={state.avs} />
      )}

      <Tabs
        className="my-4 w-full"
        classNames={{
          cursor: 'border border-outline shadow-none rounded',
          panel: 'p-0',
          tab: 'h-fit p-2',
          tabList: 'bg-content1 border border-outline p-2 rounded-lg w-full'
        }}
        disabledKeys={['restakers']}
        radius="sm"
        size="lg"
      >
        <Tab
          key="tvl"
          title={
            <div className="flex flex-col">
              <div className="text-sm text-foreground-2 group-aria-selected:text-foreground-1">
                Total value
              </div>
              <div>
                {state.isAVSLoading ? (
                  <Skeleton className="mt-2 h-4 w-full rounded-md" />
                ) : (
                  <span className="text-foreground-1 group-aria-selected:text-foreground">
                    {formatETH(
                      state.totalTokens.lst + state.totalTokens.eth,
                      compact
                    )}
                  </span>
                )}
              </div>
            </div>
          }
        >
          <AVSDetailsTVLTab
            ethRate={state.ethRate}
            isAVSLoading={state.isAVSLoading}
            lst={state.strategies}
            totalTokens={state.totalTokens}
          />
        </Tab>

        <Tab
          key="operators"
          title={
            <div className="flex flex-col">
              <div className="text-sm text-foreground-2 group-aria-selected:text-foreground-1">
                Operators
              </div>
              <div>
                {state.isAVSLoading ? (
                  <Skeleton className="my-1 h-4 w-full rounded-md" />
                ) : (
                  <span className="text-foreground-1 group-aria-selected:text-foreground">
                    {formatNumber(state.avs.operators)}
                  </span>
                )}
              </div>
            </div>
          }
        >
          <AVSDetailsOperatorsTab
            operators={state.avs?.operators}
            totalTokens={state.totalTokens}
          />
        </Tab>

        <Tab
          key="restakers"
          title={
            <div className="flex flex-col">
              <div className="text-sm">Restakers</div>
              <div>
                {state.isAVSLoading ? (
                  <Skeleton className="my-1 h-4 w-full rounded-md" />
                ) : (
                  <span>{formatNumber(state.avs.stakers)}</span>
                )}
              </div>
            </div>
          }
        />
      </Tabs>
    </>
  );
}
