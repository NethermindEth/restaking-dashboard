import { formatETH, formatUSD } from '../shared/formatters';
import { handleServiceError, reduceState } from '../shared/helpers';
import ErrorMessage from '../shared/ErrorMessage';
import log from '../shared/logger';
import { Skeleton } from '@nextui-org/react';
import { useEffect } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import { useTailwindBreakpoint } from '../shared/hooks/useTailwindBreakpoint';

export default function LRTTotalValue({ totalLRT }) {
  const { eigenlayerService, lrtService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {});

  const compact = !useTailwindBreakpoint('md');

  useEffect(() => {
    async function fetchDelegations() {
      log.debug('Fetching LRT data');

      dispatch({ isLoadingDelegations: true });

      let delegations;
      let error;

      try {
        const results = await lrtService.getLatestDelegations();

        log.debug('Fetched LRT delegations:', results.length);

        let total = Number(
          results.protocols
            .map(p => BigInt(p.amount))
            .reduce((acc, amount) => (acc += amount), 0n) / BigInt(1e18)
        );

        delegations = { rate: results.rate, total };
      } catch (e) {
        log.error('Failed fetching LRT delegations', e);

        error = handleServiceError(e);
      }

      dispatch({
        delegations,
        delegationsError: error,
        isLoadingDelegations: false
      });
    }

    async function fetchELTotal() {
      log.debug('Fetching EigenLayer TVL');

      dispatch({ isLoadingTVL: true });

      let tvl;
      let error;

      try {
        const results = await eigenlayerService.getEigenLayerTVLOvertime();

        log.debug('Fetched EigenLayer TVL:', results.length);

        const latest = results[results.length - 1];

        tvl = latest.ethTVL + latest.lstTVL;
      } catch (e) {
        log.error('Failed fetching LRT delegations', e);

        error = handleServiceError(e);
      }

      dispatch({ isLoadingTVL: false, tvl, tvlError: error });
    }

    fetchDelegations();
    fetchELTotal();
  }, [dispatch, eigenlayerService, lrtService]);

  return (
    <>
      <div className="rd-box mb-4 flex flex-row items-center justify-between p-4">
        <div className="flex basis-1/2 flex-col items-center gap-2 border-outline">
          <div className="text-foreground-2">TVL</div>
          {state.isLoadingDelegations && (
            <Skeleton
              classNames={{ base: 'h-4 w-20 rounded-md border-none' }}
            />
          )}
          {!state.isLoadingDelegations && state.delegationsError && (
            <ErrorMessage message="Failed loading LRT TVL" />
          )}
          {!state.isLoadingDelegations && state.delegations && (
            <div className="text-center">
              <div className="text-base text-foreground-1">
                {formatUSD(
                  state.delegations?.total * state.delegations?.rate,
                  compact
                )}
              </div>
              <div className="text-foreground-2">
                {formatETH(state.delegations?.total, compact)}
              </div>
            </div>
          )}
        </div>
        <div className="flex basis-1/3 flex-col items-center gap-2 border-x border-outline">
          <div className="text-center text-foreground-2">Total LRT</div>
          {state.isLoadingTVL && (
            <Skeleton
              classNames={{ base: 'h-4 w-20 rounded-md border-none' }}
            />
          )}
          {state.error && (
            <ErrorMessage message="Failed loading total number of LRT" />
          )}
          {!state.isLoadingTVL && (
            <div className="text-center">
              <div className="text-base text-foreground-1">{totalLRT}</div>
            </div>
          )}
        </div>
        <div className="flex basis-1/2 flex-col items-center gap-2 ps-2">
          <div className="text-center text-foreground-2">
            Percentage on EigenLayer
          </div>
          {(state.isLoadingTVL || state.isLoadingDelegations) && (
            <Skeleton
              classNames={{ base: 'h-4 w-20 rounded-md border-none' }}
            />
          )}
          {!state.isLoadingDelegations &&
            !state.isLoadingTVL &&
            (state.delegationsError || state.tvlError) && (
              <ErrorMessage message="Failed loading EigenLayer TVL" />
            )}
          {!state.isLoadingTVL &&
            !state.isLoadingDelegations &&
            state.delegations &&
            state.tvl && (
              <div className="text-base text-foreground-1">
                {Math.round((state.delegations?.total * 100) / state.tvl)}%
              </div>
            )}
        </div>
      </div>
    </>
  );
}
