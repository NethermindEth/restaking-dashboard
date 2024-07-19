import { formatEther } from 'ethers';
import log from '../shared/logger';
import LRTDistribution from './LRTDistribution';
import LRTList from './LRTList';
import LRTTotalValue from './LRTTotalValue';
import { reduceState } from '../shared/helpers';
import { Spinner } from '@nextui-org/react';
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

      try {
        const results = await lrtService.getAll();

        log.debug('Fetched LRT data:', results.length);

        dispatch({ results });
      } catch (e) {
        // TODO: handle error
        log.error('Failed fetching LRT data', e);
      } finally {
        dispatch({ isLoadingLRTData: false });
      }
    }

    async function fetchDelegations() {
      log.debug('Fetching LRT data');

      dispatch({ isLoadingDelegations: true });

      try {
        const delegations = await lrtService.getLatestDelegations();

        log.debug('Fetched LRT delegations:', delegations.length);

        let total = Number(
          formatEther(
            delegations.protocols
              .map(p => BigInt(p.amount))
              .reduce((acc, amount) => (acc += amount), 0n)
          )
        ).toFixed(0);

        dispatch({ delegations: { total, rate: delegations.rate } });
      } catch (e) {
        // TODO: handle error
        log.error('Failed fetching LRT delegations', e);
      } finally {
        dispatch({ isLoadingDelegations: false });
      }
    }

    async function fetchELTotal() {
      log.debug('Fetching EigenLayer TVL');

      dispatch({ isLoadingTVL: true });

      try {
        const tvls = await eigenlayerService.getEigenLayerTVLOvertime();

        log.debug('Fetched EigenLayer TVL:', tvls.length);

        const latest = tvls[tvls.length - 1];
        const tvl = Number(
          formatEther(BigInt(latest.ethTVL) + BigInt(latest.lstTVL))
        );

        dispatch({ elTVL: tvl });
      } catch (e) {
        // TODO: handle error
        log.error('Failed fetching LRT delegations', e);
      } finally {
        dispatch({ isLoadingTVL: false });
      }
    }

    fetchData();
    fetchDelegations();
    fetchELTotal();
  }, [dispatch, eigenlayerService, lrtService]);

  return (
    <>
      <div className="mb-4 font-display text-3xl font-medium text-foreground-1">
        Liquid restaking tokens
      </div>
      <div className="mb-4 text-xs text-foreground-1">
        Liquid Restaking Tokens (LRTs) are similar to Liquid Staking Tokens
        except they not only capture the rewards from staking, but also the
        rewards generated from restaking liquid staked assets (such as LSTs or
        Beacon Ether) on EigenLayer. They allow users to earn rewards from
        restaking while maintaining liquidity, as the tokens can be traded,
        transferred, or used in various DeFi applications.
      </div>
      <LRTTotalValue
        delegations={state.delegations}
        isLoadingDelegations={state.isLoadingDelegations}
        isLoadingTVL={state.isLoadingTVL}
        tvl={state.elTVL}
      />
      <div className="flex flex-col gap-4 xl:flex-row">
        {state.isLoadingLRTData && (
          <div className="flex h-[512px] w-full items-center justify-center rounded-lg border border-outline bg-content1 p-4">
            <Spinner color="primary" size="lg" />
          </div>
        )}
        {!state.isLoadingLRTData && state.results && (
          <>
            <LRTDistribution data={state.results} height={512} />
            <LRTList data={state.results[state.results.length - 1]} />
          </>
        )}
      </div>
    </>
  );
}
