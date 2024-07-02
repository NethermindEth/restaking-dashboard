import React, { useCallback, useEffect, useMemo } from 'react';
import { Card, CardBody, CardHeader, cn } from '@nextui-org/react';
import GraphTimelineSelector from '../shared/GraphTimelineSelector';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';
import { ParentSize } from '@visx/responsive';
import { useServices } from '../@services/ServiceContext';
import OperatorTVLOverTimeChart from './OperatorTVLOverTimeChart';

const OperatorTVLOverTime = ({ opAddress, currentTVL }) => {
  const { operatorService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    timelineTab: '7days',
    tvlOvertimeData: []
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

  useEffect(() => {
    (async () => {
      try {
        const tvlOvertimeData = await operatorService.getOperatorTVL(opAddress);
        dispatch({
          tvlOvertimeData
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
          <div className="font-light text-lg text-foreground-1">TVL</div>
          <div className="font-light">
            <div className="text-base ">
              <span>{currentTVL} ETH</span>
            </div>
            <div className="text-xs text-success">TODO USD</div>
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
            <OperatorTVLOverTimeChart
              data={filteredData}
              width={width}
              height={height}
              opAddress={opAddress}
            />
          )}
        </ParentSize>
      </CardBody>
    </Card>
  );
};

export default OperatorTVLOverTime;
