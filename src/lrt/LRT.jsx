import log from '../shared/logger';
import LRTDistribution from './LRTDistribution';
import LRTList from './LRTList';
import { reduceState } from '../shared/helpers';
import { useEffect } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';

export default function LRT() {
  const { lrtService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {});

  useEffect(() => {
    async function fetchData() {
      log.debug('Fetching LRT data');

      try {
        const results = await lrtService.getAll();

        log.debug('Fetched LRT data:', results.length);

        dispatch({ results });
      } catch (e) {
        // TODO: handle error
        log.error('Failed fetching LRT data', e);
      }
    }

    // TODO: loading indicators

    fetchData();
  }, [dispatch, lrtService]);

  return (
    <>
      <div className="font-display font-medium mb-4 text-foreground-1 text-3xl">
        Liquid restaking tokens
      </div>
      <div className="text-foreground-1 text-xs mb-4">
        Liquid Restaking Tokens (LRTs) are similar to Liquid Staking Tokens
        except they not only capture the rewards from staking, but also the
        rewards generated from restaking liquid staked assets (such as LSTs or
        Beacon Ether) on EigenLayer. They allow users to earn rewards from
        restaking while maintaining liquidity, as the tokens can be traded,
        transferred, or used in various DeFi applications.
      </div>
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="basis-full bg-content1 border border-outline p-4 rounded-lg text-sm">
          {state.results && (
            <LRTDistribution data={state.results} height={512} />
          )}
        </div>
        <div className="bg-content1 border border-outline rounded-lg text-sm">
          {state.results && (
            <LRTList data={state.results[state.results.length - 1]} />
          )}
        </div>
      </div>
    </>
  );
}
