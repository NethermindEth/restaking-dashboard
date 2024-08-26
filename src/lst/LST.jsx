import { handleServiceError, reduceState } from '../shared/helpers';
import ErrorMessage from '../shared/ErrorMessage';
import LSTDistribution from './LSTDistribution';
import LSTList from './LSTList';
import LSTTotalValue from './LSTTotalValue';
import { ParentSize } from '@visx/responsive';
import { Spinner } from '@nextui-org/react';
import { useEffect } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';

export default function LST() {
  const { eigenlayerService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    error: undefined,
    ethRate: 1,
    isLoadingLST: true,
    lst: [],
    rankings: []
  });

  useEffect(() => {
    async function fetchLSTTotalValue() {
      dispatch({ isLoadingLST: true, error: undefined });
      try {
        const data = await eigenlayerService.getEigenLayerLSTTotalValue();
        if (data.length > 0) {
          const current = data[data.length - 1];
          const rankings = current.strategies;
          rankings.sort((a, b) => {
            if (a.value < b.value) {
              return 1;
            }

            if (a.value > b.value) {
              return -1;
            }

            return 0;
          });

          dispatch({
            rankings,
            ethRate: current.rate,
            lst: data,
            isLoadingLST: false
          });
        }
      } catch (e) {
        dispatch({
          isLoadingLST: false,
          error: handleServiceError(e)
        });
      }
    }

    fetchLSTTotalValue();
  }, [dispatch, eigenlayerService]);

  return (
    <div>
      <div className="mb-4 font-display text-3xl font-medium text-foreground-1">
        Liquid staking tokens
      </div>
      <div className="mb-4 text-sm text-foreground-1">
        Liquid staking tokens (LSTs) restaked on EigenLayer are a form of
        cryptocurrency that represent staked assets in a liquidity pool or
        staking protocol. They allow users to earn rewards from staking while
        maintaining liquidity, as the tokens can be traded, transferred, or used
        in various DeFi applications. LSTs can be restaked on EigenLayer to earn
        restaking rewards, further maximizing yield for restaker
      </div>
      <LSTTotalValue
        ethRate={state.ethRate}
        totalLST={getNumberOfLST(state.lst)}
      />
      <div className="flex flex-col gap-4">
        {(state.isLoadingLST || state.error) && (
          <div className="rd-box flex h-[512px] w-full items-center justify-center p-4">
            {state.isLoadingLST && <Spinner color="primary" size="lg" />}
            {state.error && <ErrorMessage error={state.error} />}
          </div>
        )}
        {!state.isLoadingLST && !state.error && state.lst && (
          <>
            <ParentSize>
              {parent => {
                return (
                  <LSTDistribution
                    height={512}
                    points={state.lst}
                    rankings={state.rankings}
                    width={parent.width}
                  />
                );
              }}
            </ParentSize>

            <LSTList data={state.rankings} latestRate={state.ethRate} />
          </>
        )}
      </div>
    </div>
  );
}

const getNumberOfLST = data => {
  if (data.length === 0) {
    return 0;
  }

  const latest = data[data.length - 1];

  return data[latest].strategies?.length ?? 0;
};
