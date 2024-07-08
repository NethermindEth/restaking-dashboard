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
    <Card radius="md" className="bg-content1 border border-outline p-4 ">
      <CardHeader className="flex flex-wrap justify-between gap-3">
        <div className="space-y-2 block">
          <div className="font-light text-lg text-foreground-active">TVL</div>
          <div className="font-light">
            <div className="text-base ">
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
      <CardBody className="w-full h-[400px]">
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
    <div className="p-0 w-full flex items-center gap-3">
      <div className="border border-outline p-2 rounded-lg w-full md:w-fit flex items-center gap-3">
        <div
          className={`text-center text-foreground-2 rounded-md py-1 px-6 min-w-fit w-full md:w-20 cursor-pointer ${
            rate === 'usd' &&
            'bg-default border border-outline text-foreground-active'
          }`}
          onClick={() => onRateChange('usd')}
        >
          USD
        </div>

        <div
          className={`text-center text-foreground-2 rounded-md py-1 px-6 min-w-fit w-full md:w-20 cursor-pointer ${
            rate === 'eth' &&
            'bg-default border border-outline text-foreground-active'
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
