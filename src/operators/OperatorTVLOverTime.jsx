import React, { useCallback, useEffect, useMemo } from 'react';
import { Card, CardBody, CardHeader, cn } from '@nextui-org/react';
import GraphTimelineSelector from '../shared/GraphTimelineSelector';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';
import { ParentSize } from '@visx/responsive';
import { useServices } from '../@services/ServiceContext';
import OperatorTVLOverTimeChart from './OperatorTVLOverTimeChart';
import { formatNumber } from '../utils';

const OperatorTVLOverTime = ({ opAddress, currentTVL }) => {
  const { operatorService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    timelineTab: 'all',
    tvlOvertimeData: [],
    currentRate: 'usd',
    rate: 1
  });

  const getDataByRange = useCallback(() => {
    switch (state.timelineTab) {
      case '7days':
        return state.tvlOvertimeData.slice(-7);
      case '30days':
        return state.tvlOvertimeData.slice(-30);
      default:
        return state.tvlOvertimeData;
    }
  }, [state.tvlOvertimeData, state.timelineTab]);

  const filteredData = useMemo(() => {
    if (!state.tvlOvertimeData) return null;
    return getDataByRange();
  }, [state.tvlOvertimeData, state.timelineTab]);

  const handleTimelineChange = useCallback(
    tab => {
      dispatch({ timelineTab: tab });
    },
    [dispatch]
  );

  const handleRateChange = useCallback(
    rate => {
      dispatch({ currentRate: rate });
    },
    [dispatch]
  );

  useEffect(() => {
    (async () => {
      try {
        const tvlOvertimeData = await operatorService.getOperatorTVL(opAddress);

        dispatch({
          tvlOvertimeData,
          rate: tvlOvertimeData[tvlOvertimeData.length - 1].rate
        });
      } catch (error) {
        // TODO: handle error
      }
    })();
  }, []);

  return (
    <Card radius="md" className="border border-outline bg-content1 p-4">
      <CardHeader className="flex flex-wrap justify-between gap-3">
        <div className="block space-y-2">
          <div className="text-foreground-active text-lg font-light">TVL</div>
          <div className="font-light">
            <div className="text-base">
              <span>{currentTVL} ETH</span>
            </div>
            <div className="text-xs text-success">
              ${formatNumber(parseFloat(currentTVL) * state.rate)}
            </div>
          </div>
        </div>

        <div className="flex gap-x-6">
          <RateSelector
            rate={state.currentRate}
            onRateChange={handleRateChange}
          />
          <GraphTimelineSelector
            timelineTab={state.timelineTab}
            onTimelineChange={handleTimelineChange}
          />
        </div>
      </CardHeader>
      <CardBody className="h-[400px] w-full">
        <ParentSize>
          {({ width, height }) => (
            <OperatorTVLOverTimeChart
              data={filteredData}
              width={width}
              height={height}
              opAddress={opAddress}
              useUsdRate={state.currentRate === 'usd'}
            />
          )}
        </ParentSize>
      </CardBody>
    </Card>
  );
};

function RateSelector({ rate, onRateChange }) {
  return (
    <div className="flex w-full items-center gap-3 p-0">
      <div className="flex w-full items-center gap-3 rounded-lg border border-outline p-2 md:w-fit">
        <div
          className={`w-full min-w-fit cursor-pointer rounded-md px-6 py-1 text-center text-foreground-2 md:w-20 ${
            rate === 'usd' &&
            'text-foreground-active border border-outline bg-default'
          }`}
          onClick={() => onRateChange('usd')}
        >
          USD
        </div>

        <div
          className={`w-full min-w-fit cursor-pointer rounded-md px-6 py-1 text-center text-foreground-2 md:w-20 ${
            rate === 'eth' &&
            'text-foreground-active border border-outline bg-default'
          }`}
          onClick={() => onRateChange('eth')}
        >
          ETH
        </div>
      </div>
    </div>
  );
}

export default OperatorTVLOverTime;
