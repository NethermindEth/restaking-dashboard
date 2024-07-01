import { Card, CardBody, CardHeader } from '@nextui-org/react';
import { ParentSize } from '@visx/responsive';
import { useCallback, useEffect, useMemo } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import GraphTimelineSelector from '../shared/GraphTimelineSelector';
import { reduceState } from '../shared/helpers';

const EigenTvlOvertime = () => {
  const { eigenService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    eigenTvlData: [],
    timelineTab: '7days'
  });

  //   eigenTvlData
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
  }, [state.eigenTvlData, state.timelineTab]);

  const handleTimelineChange = tab => {
    dispatch({ timelineTab: tab });
  };

  useEffect(() => {
    (async () => {
      const eigenTvlData = await eigenService.getEigenTvlOvertime();
      dispatch({ eigenTvlData });
    })();
  }, [dispatch]);

  return (
    <Card radius="md" className="bg-content1 w-full border border-outline p-4">
      <CardHeader className="flex flex-wrap justify-between gap-3">
        <div className="space-y-2 block">
          <div className="font-light">
            <div className="text-base text-foreground-1">
              <span>Eigen TVL over time</span>
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
            <>
              {width}
              {/*  <EigenTvlOvertimeChart
               data={filteredData}
               width={width}
               height={height}
            /> */}
            </>
          )}
        </ParentSize>
      </CardBody>
    </Card>
  );
};

export default EigenTvlOvertime;
