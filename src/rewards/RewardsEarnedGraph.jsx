import React, { useCallback, useMemo } from 'react';
import {
  Tab,
  Tabs
} from '@nextui-org/react';
import { DistributedRewardBarChart } from '../home/charts/DistributedRewardPieChart';
import { useMutativeReducer } from 'use-mutative';
import {
  reduceState
} from '../shared/helpers';
import { useTailwindBreakpoint } from '../shared/hooks/useTailwindBreakpoint';
import { formatETH, formatNumber, formatUSD } from '../shared/formatters';


export const RewardsEarnedGraph = ({ ethRate, rewardsTotal }) => {
  const compact = !useTailwindBreakpoint('sm');
  const [state, dispatch] = useMutativeReducer(reduceState, {
    error: undefined,
    isChartLoading: true,
    points: undefined,
    useRate: true
  });

  const handleRateSelectionChange = useCallback(
    key => {
      dispatch({ useRate: key === 'usd' });
    },
    [dispatch]
  );

  const getLatestTotals = useMemo(() => {
    return state.useRate
      ? formatUSD(ethRate * rewardsTotal, compact)
      : `${Number(rewardsTotal).toFixed(4)} ETH`;
  }, [compact, ethRate, rewardsTotal, state.useRate]);

  return (
    <div className='border rd-box border-outline px-4 pt-4 pb-6 text-default-700 rounded-lg mb-4'>
      <div className='flex items-center justify-between flex-wrap'>
        <div>
          <div className='flex items-center gap-1 mb-2'>
            <h2 className='text-default-700'>
              Rewards earned over time
            </h2>

            <span className="material-symbols-outlined text-xs" style={{
              fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
            }}>
              info
            </span>
          </div>

          <p className='text-default-2'>
            {getLatestTotals}
          </p>

        </div>

        <div className="flex flex-col ms-auto mr-6">
          <Tabs
            className="w-full"
            classNames={{
              cursor: 'rounded border border-outline shadow-none',
              panel: 'p-0',
              tab: 'h-fit px-2 py-1 text-xs min-w-[70px]',
              tabList: 'rd-box !overflow-x-scroll p-x py-1'
            }}
            radius="sm"
            size="lg"
            onSelectionChange={handleRateSelectionChange}
          >
            <Tab key="eth" title="ETH" />
            <Tab key="usd" title="USD" />
          </Tabs>
        </div>


        <div className="flex flex-col">
          <Tabs
            className="w-full"
            classNames={{
              cursor: 'rounded border border-outline shadow-none',
              panel: 'p-0',
              tab: 'h-fit px-2 py-1 text-xs min-w-[70px]',
              tabList: 'rd-box !overflow-x-scroll p-x py-1'
            }}
            radius="sm"
            size="lg"
          >
            <Tab key="7D" title="7D" />
            <Tab key="1m" title="1m">
            </Tab>
            <Tab key="3m" title="3m">
            </Tab>
            <Tab key="All" title="All">
            </Tab>
          </Tabs>
        </div>
      </div>
      <DistributedRewardBarChart />

      <div className='text-default-700 text-xs flex items-center justify-between mt-2'>
        <div className='flex items-center gap-1 '>
          <div className='w-2 h-2 bg-[#C9A9E9] rounded-full'></div>
          <p>Native Token 24,881,994 ETH</p>
        </div>

        <div className='flex items-center gap-1 '>
          <div className='w-2 h-2 bg-[#9353D3] rounded-full'></div>
          <p>LST 10,334,122 ETH</p>
        </div>


        <div className='flex items-center gap-1 '>
          <div className='w-2 h-2 bg-[#481878] rounded-full'></div>
          <p>EIGEN Token 10,334,122 ETH</p>
        </div>
      </div>
    </div>
  )
}