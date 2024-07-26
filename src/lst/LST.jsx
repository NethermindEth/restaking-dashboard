import React, { useEffect } from 'react';
import { formatNumber } from '../utils';
import { Divider } from '@nextui-org/react';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';
import { useServices } from '../@services/ServiceContext';
import { formatEther } from 'ethers';
import LSTList from './LSTList';
import LSTDistributionGraph from './LSTDistributionGraph';
import { ParentSize } from '@visx/responsive';

export default function LST() {
  const { eigenlayerService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    isLoadingLST: true,
    rankings: [],
    lst: [],
    latestRate: 1,
    tvl: 0,
    percentage: 0
  });

  useEffect(() => {
    async function fetchEigenLayerTVL() {
      const data = await eigenlayerService.getEigenLayerTVLOvertime();
      if (data.length > 0) {
        const current = data[data.length - 1];

        dispatch({
          tvl: parseFloat(formatEther(current.lstTVL)),
          percentage:
            (parseFloat(current.lstTVL) /
              (parseFloat(current.lstTVL) + parseFloat(current.ethTVL))) *
            100
        });
      }
    }

    fetchEigenLayerTVL();
  }, []);

  useEffect(() => {
    async function fetchLSTTotalValue() {
      dispatch({ isLoadingLST: true });
      const data = await eigenlayerService.getEigenLayerLSTTotalValue();
      if (data.length > 0) {
        const current = data[data.length - 1];
        const rankings = Object.entries(current.tvl);
        rankings.sort((a, b) => {
          if (a[1] < b[1]) {
            return 1;
          }

          if (a[1] > b[1]) {
            return -1;
          }

          return 0;
        });

        dispatch({
          rankings,
          latestRate: current.rate,
          lst: data,
          isLoadingLST: false
        });
      }
    }

    fetchLSTTotalValue();
  }, []);

  return (
    <div>
      <div className="my-4 font-display text-3xl font-medium text-foreground-1">
        Liquid Staking Tokens
      </div>
      <div className="mb-4 font-display text-xs font-medium text-foreground-1">
        Liquid Staking Tokens (LSTs) restaked on EigenLayer are a form of
        cryptocurrency that represent staked assets in a liquidity pool or
        staking protocol. They allow users to earn rewards from staking while
        maintaining liquidity, as the tokens can be traded, transferred, or used
        in various DeFi applications. LSTs can be restaked on EigenLayer to earn
        restaking rewards, further maximizing yield for restaker
      </div>
      <div className="my-4 mt-6 rounded-lg border border-outline bg-content1 text-sm">
        <div className="flex flex-row items-center justify-between gap-x-2 p-4 text-foreground-1">
          <div className="flex basis-1/2 flex-col items-center text-center">
            <span>TVL</span>
            <span>{formatNumber(state.tvl)} ETH</span>
          </div>
          <Divider className="h-16" orientation="vertical" />
          <div className="flex basis-1/2 flex-col items-center">
            <span className="text-center">Number of LST Protocols</span>
            <span>{state.rankings.length}</span>
          </div>
          <Divider className="h-16" orientation="vertical" />
          <div className="flex basis-1/2 flex-col items-center">
            <span className="text-center">Percentage on EigenLayer TVL</span>
            <span>{state.percentage.toFixed(2)} %</span>
          </div>
        </div>
      </div>

      <div>
        <ParentSize>
          {parent => {
            return (
              <LSTDistributionGraph
                data={state.lst}
                height={512}
                rankings={state.rankings}
                width={parent.width}
              />
            );
          }}
        </ParentSize>
      </div>

      <div className="mt-4">
        <LSTList
          data={state.rankings}
          isLoading={state.isLoadingLST}
          latestRate={state.latestRate}
        />
      </div>
    </div>
  );
}
