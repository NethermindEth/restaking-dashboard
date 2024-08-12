import { BEACON_STRATEGY, EIGEN_STRATEGY } from './helpers';
import { formatETH, formatNumber } from '../shared/formatters';
import { handleServiceError, reduceState } from '../shared/helpers';
import { Skeleton, Tab, Tabs } from '@nextui-org/react';
import AVSDetailsHeader from './AVSDetailsHeader';
import AVSDetailsOperatorsTab from './AVSDetailsOperatorsTab';
import AVSDetailsTVLTab from './AVSDetailsTVLTab';
import ErrorMessage from '../shared/ErrorMessage';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMutativeReducer } from 'use-mutative';
import { useParams } from 'react-router-dom';
import { useServices } from '../@services/ServiceContext';
import { useTailwindBreakpoint } from '../shared/hooks/useTailwindBreakpoint';

export default function AVSDetails() {
  const { address, tab } = useParams();
  const { pathname } = useLocation();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    avs: undefined,
    error: undefined,
    ethRate: 1,
    isAVSLoading: true,
    strategies: undefined,
    totalTokens: {
      lst: 0,
      eth: 0,
      eigen: 0
    }
  });
  const { avsService } = useServices();
  const compact = !useTailwindBreakpoint('lg');

  useEffect(() => {
    dispatch({ error: undefined, isAVSLoading: true });

    (async () => {
      try {
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
          isAVSLoading: false,
          strategies,
          totalTokens: totals
        });
      } catch (e) {
        dispatch({
          error: handleServiceError(e),
          isAVSLoading: false
        });
      }
    })();
  }, [address, avsService, dispatch]);

  return (
    <>
      {state.isAVSLoading && (
        <div className="min-h-[128px] w-full overflow-hidden rounded-lg border border-outline bg-content1 p-4">
          <div className="flex max-w-[300px] items-center">
            <Skeleton className="size-12 shrink-0 rounded-full border border-outline" />
            <Skeleton className="ml-2 h-8 w-full rounded-md" />
          </div>
          <div className="my-4">
            <Skeleton className="h-16 w-full rounded-md" />
          </div>
        </div>
      )}

      {state.error && (
        <div className="flex min-h-[128px] w-full items-center justify-center overflow-hidden rounded-lg border border-outline bg-content1 p-4">
          <ErrorMessage error={state.error} />
        </div>
      )}

      {!state.isAVSLoading && !state.error && (
        <AVSDetailsHeader avs={state.avs} />
      )}

      <Tabs
        className="my-4 w-full"
        classNames={{
          cursor: 'rounded border border-outline shadow-none',
          panel: 'p-0',
          tab: 'h-fit p-2',
          tabList: 'w-full rounded-lg border border-outline bg-content1 p-2'
        }}
        disabledKeys={['restakers']}
        radius="sm"
        selectedKey={tab ? pathname : pathname + '/tvl'}
        size="lg"
      >
        <Tab
          href={`/avs/${address}/tvl`}
          key={`/avs/${address}/tvl`}
          title={
            <div className="flex flex-col items-center">
              <div className="text-sm text-foreground-2 group-aria-selected:text-foreground-1">
                Total value
              </div>
              <div>
                {state.isAVSLoading && (
                  <Skeleton className="mt-2 h-4 w-full rounded-md" />
                )}

                {state.error && <ErrorMessage error={state.error} />}

                {!state.isAVSLoading && !state.error && (
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
            avsError={state.error}
            ethRate={state.ethRate}
            isAVSLoading={state.isAVSLoading}
            lst={state.strategies}
            totalTokens={state.totalTokens}
          />
        </Tab>

        <Tab
          href={`/avs/${address}/operators`}
          key={`/avs/${address}/operators`}
          title={
            <div className="flex flex-col items-center">
              <div className="text-sm text-foreground-2 group-aria-selected:text-foreground-1">
                Operators
              </div>
              <div>
                {state.isAVSLoading && (
                  <Skeleton className="my-1 h-4 w-full rounded-md" />
                )}

                {state.error && <ErrorMessage error={state.error} />}

                {!state.isAVSLoading && !state.error && (
                  <span className="text-foreground-1 group-aria-selected:text-foreground">
                    {formatNumber(state.avs.operators)}
                  </span>
                )}
              </div>
            </div>
          }
        >
          <AVSDetailsOperatorsTab
            avsError={state.error}
            isAVSLoading={state.isAVSLoading}
            operators={state.avs?.operators}
            totalTokens={state.totalTokens}
          />
        </Tab>

        <Tab
          key="restakers"
          title={
            <div className="flex flex-col items-center">
              <div className="text-sm">Restakers</div>
              <div>
                {state.isAVSLoading && (
                  <Skeleton className="my-1 h-4 w-full rounded-md" />
                )}

                {state.error && <ErrorMessage error={state.error} />}

                {!state.isAVSLoading && !state.error && (
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
