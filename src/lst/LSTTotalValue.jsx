import { formatETH, formatUSD } from '../shared/formatters';
import { handleServiceError, reduceState } from '../shared/helpers';
import ErrorMessage from '../shared/ErrorMessage';
import log from '../shared/logger';
import { Skeleton } from '@nextui-org/react';
import { useEffect } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';

export default function LSTTotalValue({ ethRate }) {
  const { eigenlayerService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    isLoadingTVL: true,
    error: undefined,
    percentage: undefined
  });

  useEffect(() => {
    async function fetchELTotal() {
      log.debug('Fetching EigenLayer TVL');

      dispatch({ isLoadingTVL: true, error: undefined });

      try {
        const data = await eigenlayerService.getEigenLayerTVLOvertime();

        if (data.length > 0) {
          const latest = data[data.length - 1];
          dispatch({
            isLoadingTVL: false,
            lstTVL: latest.lstTVL,
            percentage: Math.round(
              (latest.lstTVL * 100) / (latest.lstTVL + latest.ethTVL)
            )
          });
        }
      } catch (e) {
        dispatch({
          isLoadingTVL: false,
          error: handleServiceError(e)
        });
      }
    }

    fetchELTotal();
  }, [dispatch, eigenlayerService]);

  return (
    <>
      <div className="rd-box mb-4 flex flex-row items-center justify-between p-4">
        <div className="flex basis-1/2 flex-col items-center gap-2 border-r border-outline">
          <div className="text-foreground-2">TVL</div>
          {state.isLoadingTVL && (
            <Skeleton
              classNames={{ base: 'h-4 w-20 rounded-md border-none' }}
            />
          )}
          {state.error && <ErrorMessage message="Failed loading LST TVL" />}
          {!state.isLoadingTVL && state.lstTVL && (
            <div className="text-center">
              <div className="text-base text-foreground-1">
                {formatUSD(state.lstTVL * ethRate)}
              </div>
              <div className="text-foreground-2">{formatETH(state.lstTVL)}</div>
            </div>
          )}
        </div>
        <div className="flex basis-1/2 flex-col items-center gap-2 ps-2">
          <div className="text-center text-foreground-2">
            Percentage on EigenLayer
          </div>
          {state.isLoadingTVL && (
            <Skeleton
              classNames={{ base: 'h-4 w-20 rounded-md border-none' }}
            />
          )}
          {state.error && (
            <ErrorMessage message="Failed loading EigenLayer TVL" />
          )}
          {!state.isLoadingTVL && state.percentage && (
            <div className="text-base text-foreground-1">
              {state.percentage}%
            </div>
          )}
        </div>
      </div>
    </>
  );
}
