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
    growth: 0
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

          <div className="font-light text-xs text-default-2">$ 4,554,567</div>
        </div>

        <GraphTimelineSelector
          timelineTab={state.timelineTab}
          onTimelineChange={handleTimelineChange}
        />
      </CardHeader>
      <CardBody className="w-full h-[400px]">
        <ParentSize>
          {({ width, height }) => (
            <AVSTotalValueOvertimeChart
              data={filteredData}
              width={width}
              height={height}
            />
          )}
        </ParentSize>
      </CardBody>
    </Card>
  );
};

export default AVSTotalValueOvertime;
