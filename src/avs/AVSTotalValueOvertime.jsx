import { Card, CardBody, CardHeader } from '@nextui-org/react';
import { ParentSize } from '@visx/responsive';
import { useCallback, useEffect, useMemo } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import GraphTimelineSelector from '../shared/GraphTimelineSelector';
import { reduceState } from '../shared/helpers';
import AVSTotalValueOvertimeChart from './AVSTotalValueOvertimeChart';
import { formatNumber, getGrowthPercentage } from '../utils';

const AVSTotalValueOvertime = ({ avsAddress }) => {
  const [state, dispatch] = useMutativeReducer(reduceState, {
    timelineTab: 'all',
    avsTotalValueOvertimeData: null,
    growth: 0,
    currentRate: 'usd'
  });
  const { avsService } = useServices();

  const getDataByRange = useCallback(() => {
    switch (state.timelineTab) {
      case '7days':
        return state.avsTotalValueOvertimeData.slice(-7);
      case '30days':
        return state.avsTotalValueOvertimeData.slice(-30);
      default:
        return state.avsTotalValueOvertimeData;
    }
  }, [state.avsTotalValueOvertimeData, state.timelineTab]);

  const filteredData = useMemo(() => {
    if (!state.avsTotalValueOvertimeData) return null;
    return getDataByRange();
  }, [state.avsTotalValueOvertimeData, state.timelineTab]);

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
    async function fetchTvlOvertime() {
      try {
        const avsTotalValueOvertimeData =
          await avsService.getAVSTotalValue(avsAddress);

        dispatch({
          avsTotalValueOvertimeData
        });
      } catch (error) {
        // TODO: handle error
      }
    }
    fetchTvlOvertime();
  }, [avsService, dispatch, avsAddress]);

  useEffect(() => {
    if (filteredData) {
      dispatch({
        growth: getGrowthPercentage(
          filteredData[0].tvl,
          filteredData[filteredData.length - 1].tvl
        )
      });
    }
  }, [filteredData]);

  return (
    <Card radius="md" className="bg-content1 border border-outline p-4 ">
      <CardHeader className="flex flex-wrap justify-between gap-3">
        <div className="space-y-2 block">
          <div className="font-light text-xl text-foreground-1">
            TVL over time
          </div>
          <div className="flex gap-2">
            <div className="font-light text-sm">
              {filteredData &&
                formatNumber(filteredData[filteredData.length - 1].tvl)}{' '}
              ETH
            </div>
            <div
              className={`font-light text-sm ${state.growth > 0 ? 'text-success' : 'text-fail'}`}
            >
              {`${state.growth > 0 ? '+' : ''}${state.growth.toFixed(2)} %`}
            </div>
          </div>

          <div className="font-light text-xs text-default-2">
            {filteredData &&
              `$${formatNumber(
                filteredData[filteredData.length - 1].tvl *
                  filteredData[filteredData.length - 1].rate
              )}`}
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
            <AVSTotalValueOvertimeChart
              data={filteredData}
              useUsdRate={state.currentRate === 'usd'}
              width={width}
              height={height}
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

export default AVSTotalValueOvertime;
