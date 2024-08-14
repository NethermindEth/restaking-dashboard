import { handleServiceError, reduceState } from '../shared/helpers';
import ErrorMessage from '../shared/ErrorMessage';
import log from '../shared/logger';
import LRTDistribution from './LRTDistribution';
import LRTList from './LRTList';
import LRTTotalValue from './LRTTotalValue';
import { Spinner } from '@nextui-org/react';
import { transformProtocols } from './helpers';
import { useEffect } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';

export default function LRT() {
  const { eigenlayerService, lrtService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {});

  useEffect(() => {
    async function fetchData() {
      log.debug('Fetching LRT data');

      dispatch({ isLoadingLRTData: true });

      let results;
      let error;

      try {
        results = await lrtService.getAll();

        log.debug('Fetched LRT data:', results.length);

        results.forEach(transformProtocols);
      } catch (e) {
        log.error('Failed fetching LRT data', e);

        error = handleServiceError(e);
      }

      dispatch({ error, isLoadingLRTData: false, lrtData: results });
    }

    fetchData();
  }, [dispatch, eigenlayerService, lrtService]);

  return (
    <>
      <div className="mb-4 font-display text-3xl font-medium text-foreground-1">
        Liquid restaking tokens
      </div>
      <div className="mb-4 text-sm text-foreground-1">
        Liquid Restaking Tokens (LRTs) are similar to Liquid Staking Tokens
        except they not only capture the rewards from staking, but also the
        rewards generated from restaking liquid staked assets (such as LSTs or
        Beacon Ether) on EigenLayer. They allow users to earn rewards from
        restaking while maintaining liquidity, as the tokens can be traded,
        transferred, or used in various DeFi applications.
      </div>
      <LRTTotalValue />
      <div className="flex flex-col gap-4">
        {(state.isLoadingLRTData || state.error) && (
          <div className="flex h-[512px] w-full items-center justify-center rounded-lg border border-outline bg-content1 p-4">
            {state.isLoadingLRTData && <Spinner color="primary" size="lg" />}
            {!state.isLoadingLRTData && state.error && (
              <ErrorMessage error={state.error} />
            )}
          </div>
        )}
        {!state.isLoadingLRTData && state.lrtData && (
          <>
            <LRTDistribution data={state.lrtData} height={512} />
            <LRTList data={state.lrtData[state.lrtData.length - 1]} />
          </>
        )}
      </div>
    </>
  );
}
