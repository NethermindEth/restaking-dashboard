import { Card, CardBody, CardHeader } from '@nextui-org/react';
import { ParentSize } from '@visx/responsive';
import { useCallback, useEffect, useMemo } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import GraphTimelineSelector from '../shared/GraphTimelineSelector';
import { reduceState } from '../shared/helpers';
import OperatorsOvertimeChart from './OperatorsOvertimeChart';
import { formatNumber, getGrowthPercentage } from '../utils';

const OperatorsOvertime = ({ avsAddress }) => {
  const [state, dispatch] = useMutativeReducer(reduceState, {
    timelineTab: '7days',
    operatorsOvertimeData: null,
    growth: 0
  });
  const { avsService } = useServices();

  const getDataByRange = useCallback(() => {
    switch (state.timelineTab) {
      case '7days':
        return state.operatorsOvertimeData.slice(-7);
      case '30days':
        return state.operatorsOvertimeData.slice(-30);
      default:
        return state.operatorsOvertimeData;
    }
  }, [state.operatorsOvertimeData, state.timelineTab]);

  const filteredData = useMemo(() => {
    if (!state.operatorsOvertimeData) return null;
    return getDataByRange();
  }, [state.operatorsOvertimeData, state.timelineTab]);

  const handleTimelineChange = useCallback(
    tab => {
      dispatch({ timelineTab: tab });
    },
    [dispatch]
  );

  useEffect(() => {
    async function fetchOperatorsOvertime() {
      try {
        const operatorsOvertimeData =
          await avsService.getAVSOperatorsOvertime(avsAddress);
        const growthPercentage = getGrowthPercentage(
          operatorsOvertimeData[operatorsOvertimeData.length - 2].operators,
          operatorsOvertimeData[operatorsOvertimeData.length - 1].operators
        );

        dispatch({
          operatorsOvertimeData: operatorsOvertimeData,
          growth: growthPercentage
        });
      } catch (error) {
        // TODO: handle error
      }
    }

    fetchOperatorsOvertime();
  }, [avsService, dispatch, avsAddress]);

  return (
    <Card radius="md" className="bg-content1 border border-outline p-4 ">
      <CardHeader className="flex flex-wrap justify-between gap-3">
        <div className="space-y-2 block">
          <div className="font-light text-lg text-foreground-1">
            Total operators over time
          </div>

          <div className="flex gap-2">
            <div className="font-light text-sm">
              {filteredData &&
                formatNumber(filteredData[filteredData.length - 1].operators)}
            </div>
            <div
              className={`font-light text-sm ${state.growth > 0 ? 'text-success' : 'text-fail'}`}
            >
              {`${state.growth > 0 ? '+' : ''}${state.growth.toFixed(2)} %`}
            </div>
          </div>
        </div>
        <GraphTimelineSelector
          timelineTab={state.timelineTab}
          onTimelineChange={handleTimelineChange}
        />
      </CardHeader>
      <CardBody className="w-full h-[400px]">
        <ParentSize>
          {({ width, height }) => (
            <OperatorsOvertimeChart
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

export default OperatorsOvertime;
