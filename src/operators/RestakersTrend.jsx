import { Card, CardBody, CardHeader } from '@nextui-org/react';
import React, { useCallback, useEffect, useMemo } from 'react';
import GraphTimelineSelector from '../shared/GraphTimelineSelector';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';
import { ParentSize } from '@visx/responsive';
import RestakersTrendChart from './RestakersTrendChart';
import { useServices } from '../@services/ServiceContext';

const RestakersTrend = ({ opAddress }) => {
  const { operatorService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    restakerTrend: [],
    timelineTab: 'all'
  });

  const getDataByRange = useCallback(() => {
    switch (state.timelineTab) {
      case '7days':
        return state.restakerTrend.slice(-7);
      case '30days':
        return state.restakerTrend.slice(-30);
      default:
        return state.restakerTrend;
    }
  }, [state.restakerTrend, state.timelineTab]);

  const filteredData = useMemo(() => {
    if (!state.restakerTrend) return null;
    return getDataByRange();
  }, [state.restakerTrend, state.timelineTab]);

  const handleTimelineChange = tab => {
    dispatch({ timelineTab: tab });
  };

  useEffect(() => {
    (async () => {
      const restakerData = await operatorService.getRestakerTrend(opAddress);
      dispatch({ restakerTrend: restakerData });
    })();
  }, []);

  return (
    <Card radius="md" className="bg-content1 w-full border border-outline p-4">
      <CardHeader className="flex flex-wrap justify-between gap-3">
        <div className="space-y-2 block">
          <span className="text-foreground-active">Restaker Trend</span>
          <div className="font-light">
            <div className="text-base text-foreground-1">
              <span>
                Total Restakers:{' '}
                {state.restakerTrend[state.restakerTrend.length - 1]
                  ?.restakers ?? 'N/A'}
              </span>
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
            <RestakersTrendChart
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

export default RestakersTrend;
