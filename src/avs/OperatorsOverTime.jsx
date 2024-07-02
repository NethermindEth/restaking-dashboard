import { Card, CardBody, CardHeader } from '@nextui-org/react';
import { ParentSize } from '@visx/responsive';
import { useCallback, useEffect, useMemo } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import GraphTimelineSelector from '../shared/GraphTimelineSelector';
import { reduceState } from '../shared/helpers';
import OperatorsOvertimeChart from './OperatorsOverTimeChart';

const OperatorsOvertime = ({ avsAddress }) => {
  const [state, dispatch] = useMutativeReducer(reduceState, {
    timelineTab: '7days',
    operatorsOvertimeData: null
  });
  const { avsService } = useServices();

  async function fetchOperatorsOvertime() {
    try {
      const operatorsOvertimeData =
        await avsService.getAVSOperatorsOvertime(avsAddress);

      dispatch({
        operatorsOvertimeData: operatorsOvertimeData
      });
    } catch (error) {
      // TODO: handle error
    }
  }

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
    fetchOperatorsOvertime();
  }, [avsService, dispatch, avsAddress]);

  return (
    <Card radius="md" className="bg-content1 border border-outline p-4 ">
      <CardHeader className="flex flex-wrap justify-between gap-3">
        <div className="font-light text-lg text-foreground-1">
          Total operators over time
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
