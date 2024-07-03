import log from '../shared/logger';
import LRTDistribution from './LRTDistribution';
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
      <div className="font-display font-medium pb-4 mb-4 text-foreground-1 text-3xl">
        Liquid restaking tokens
      </div>
      <div className="bg-content1 border border-outline p-4 rounded-lg text-sm">
        {state.results && <LRTDistribution data={state.results} height={512} />}
      </div>
    </>
  );
}
