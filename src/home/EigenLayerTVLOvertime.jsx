import { Card, CardBody, CardHeader } from '@nextui-org/react';
import { ParentSize } from '@visx/responsive';
import { useCallback, useMemo } from 'react';
import { useMutativeReducer } from 'use-mutative';
import GraphTimelineSelector from '../shared/GraphTimelineSelector';
import { reduceState } from '../shared/helpers';
import EigenLayerTVLOvertimeChart from './EigenLayerTVLOvertimeChart';

const EigenLayerTVLOvertime = ({ eigenTVLData }) => {
  const [state, dispatch] = useMutativeReducer(reduceState, {
    timelineTab: 'all'
  });

  const getDataByRange = useCallback(() => {
    switch (state.timelineTab) {
      case '7days':
        return eigenTVLData.slice(-7);
      case '30days':
        return eigenTVLData.slice(-30);
      default:
        return eigenTVLData;
    }
  }, [eigenTVLData, state.timelineTab]);

  const filteredData = useMemo(() => {
    if (!eigenTVLData) return null;
    return getDataByRange();
  }, [eigenTVLData, getDataByRange]);

  const handleTimelineChange = tab => {
    dispatch({ timelineTab: tab });
  };

  return (
    <>
      <Card radius="md" className="bg-content1 border border-outline p-4 ">
        <CardHeader className="flex flex-wrap justify-between gap-3">
          <div className="space-y-2 block">
            <div className="font-light">
              <div className="text-lg text-foreground-1">
                <span>EigenLayer TVL over time</span>
              </div>
            </div>
          </div>
          <GraphTimelineSelector
            timelineTab={state.timelineTab}
            onTimelineChange={handleTimelineChange}
          />
        </CardHeader>
        <CardBody className="w-full space-y-4">
          <div className="w-full h-[400px]">
            <ParentSize>
              {({ width, height }) => (
                <EigenLayerTVLOvertimeChart
                  data={filteredData}
                  width={width}
                  height={height}
                />
              )}
            </ParentSize>
          </div>
          <div className="text-xs text-foreground-2 pt-10">
            Due to the expanding pool of Liquid Staking Tokens {`(LST)`} and
            Liquid Restaking Tokens {`(LRT)`}, the TVL value on this dashboard
            may not always match the actual TVL of the entire token pool. Refer
            to the dashboard token list for the current LST and LRT data
            included in the TVL calculation.
          </div>
        </CardBody>
      </Card>
    </>
  );
};

export default EigenLayerTVLOvertime;
