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
        <div className="bg-content1 border border-outline rounded-lg w-full min-h-[128px] p-4">
          <div className="flex items-center max-w-[300px]">
            <Skeleton className="border border-outline rounded-full size-12 shrink-0" />
            <Skeleton className="w-full h-8 rounded-md ml-2" />
          </div>
          <div className="my-4">
            <Skeleton className="h-16 w-full rounded-md" />
          </div>
        </div>
      ) : (
        <AVSDetailsHeader avs={state.avs} />
      )}

      <Tabs
        className="my-4"
        classNames={{
          base: 'flex w-full',
          tabList: 'w-full bg-content1 border border-outline rounded-lg p-0',
          tab: 'h-100 m-2',
          panel: 'p-0'
        }}
        disabledKeys={['restakers']}
        radius="sm"
        size="lg"
      >
        <Tab
          key="tvl"
          title={
            <div className="flex flex-col">
              <div className="group-aria-selected:text-foreground-1 text-foreground-2 text-sm">
                Total value
              </div>
              <div>
                {state.isAVSLoading ? (
                  <Skeleton className="mt-2 h-4 w-full rounded-md" />
                ) : (
                  <span className="group-aria-selected:text-foreground text-foreground-1">
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
              <div className="group-aria-selected:text-foreground-1 text-foreground-2 text-sm">
                Operators
              </div>
              <div>
                {state.isAVSLoading ? (
                  <Skeleton className="my-1 h-4 w-full rounded-md" />
                ) : (
                  <span className="group-aria-selected:text-foreground text-foreground-1">
                    {formatNumber(state.avs.operators)}
                  </span>
                )}
              </div>
            </div>
          }
        >
          <AVSDetailsOperatorsTab />
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
