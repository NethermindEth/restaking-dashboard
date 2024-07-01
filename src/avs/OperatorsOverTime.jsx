import { Card, CardBody, CardHeader, cn } from '@nextui-org/react';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { localPoint } from '@visx/event';
import { GridColumns, GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { useScreenSize } from '@visx/responsive';
import { scaleLinear, scaleTime } from '@visx/scale';
import { Circle, LinePath } from '@visx/shape';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { bisector } from 'd3-array';
import { useCallback, useEffect, useMemo } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import GraphTimelineSelector from '../shared/GraphTimelineSelector';
import { reduceState } from '../shared/helpers';
import {
  formatDateToVerboseString,
  formatNumberToCompactString
} from '../utils';

const getNumberOfTicks = (width, axis) => {
  if (axis === 'x') {
    if (width < 500) return 3;
    if (width < 800) return 5;
    return 7;
  } else if (axis === 'y') {
    if (width < 500) return 3;
    if (width < 800) return 4;
    return 5;
  }
};

const getMargin = width => {
  if (width < 500) {
    return { top: 20, right: 20, bottom: 50, left: 40 };
  }
  return { top: 20, right: 20, bottom: 20, left: 60 };
};

const OperatorsOvertime = ({ avsAddress }) => {
  const [state, dispatch] = useMutativeReducer(reduceState, {
    timelineTab: '7days',
    graphData: null
  });
  const { avsService } = useServices();
  const { timelineTab, graphData } = state;
  const { width } = useScreenSize();
  const height = Math.min(400, width * 0.4);
  const {
    showTooltip,
    hideTooltip,
    tooltipOpen,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0
  } = useTooltip();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true
  });

  const bisectTimestamp = bisector(d => new Date(d.timestamp)).left;

  useEffect(() => {
    async function fetchTvlOvertime() {
      try {
        const operatorsOvertimeData =
          await avsService.getAVSOperatorsOvertime(avsAddress);

        dispatch({
          graphData: operatorsOvertimeData
        });
      } catch (error) {
        // TODO: handle error
      }
    }
    fetchTvlOvertime();
  }, [avsService, dispatch, avsAddress]);

  const getDataByRange = useCallback(() => {
    switch (state.timelineTab) {
      case '7days':
        return state.graphData.slice(-7);
      case '30days':
        return state.graphData.slice(-30);
      default:
        return state.graphData;
    }
  }, [state.graphData, state.timelineTab]);

  const sortedData = useMemo(() => {
    if (!graphData) return null;
    return getDataByRange(graphData, timelineTab);
  }, [graphData, timelineTab, getDataByRange]);

  const margin = getMargin(width);

  const dateScale = useMemo(() => {
    if (!sortedData) return null;
    return scaleTime({
      domain: [
        Math.min(...sortedData.map(d => new Date(d.timestamp))),
        Math.max(...sortedData.map(d => new Date(d.timestamp)))
      ],
      range: [margin.left, width - margin.right]
    });
  }, [sortedData, width, margin]);

  const operatorsScale = useMemo(() => {
    if (!sortedData) return null;
    const maxValue = Math.max(...sortedData.map(d => d.operators));
    const minValue = Math.min(...sortedData.map(d => d.operators));

    // create artificial range of tick values for operators count axis if operators count is constant to avoid rendering single tick value
    const yDomain =
      maxValue === minValue
        ? [maxValue * 0.9, maxValue * 1.1]
        : [minValue, maxValue + (maxValue - minValue) * 0.1];

    return scaleLinear({
      domain: yDomain,
      range: [height - margin.bottom, margin.top],
      nice: true
    });
  }, [sortedData, height, margin]);

  const handleTimelineChange = useCallback(
    tab => {
      dispatch({ timelineTab: tab });
    },
    [dispatch]
  );

  const handleMouseMove = useCallback(
    event => {
      if (!sortedData || !dateScale || !operatorsScale) return;

      const { x } = localPoint(event) || { x: 0 };
      const x0 = dateScale.invert(x);
      const index = bisectTimestamp(sortedData, x0, 1);
      const d0 = sortedData[index - 1];
      const d1 = sortedData[index];
      let d = d0;
      if (d1 && d1.timestamp) {
        d = x0 - new Date(d0.timestamp) > new Date(d1.timestamp) - x0 ? d1 : d0;
      }

      showTooltip({
        tooltipData: d,
        tooltipLeft: x,
        tooltipTop: operatorsScale(d.operators)
      });
    },
    [showTooltip, sortedData, dateScale, operatorsScale, bisectTimestamp]
  );

  return (
    <Card
      radius="md"
      className="bg-content1 border border-outline p-4 relative"
    >
      <CardHeader className="flex items-end flex-wrap justify-between gap-3">
        <div className="font-light text-lg text-foreground-1">
          Total operators over time
        </div>
        <GraphTimelineSelector
          timelineTab={timelineTab}
          onTimelineChange={handleTimelineChange}
        />
      </CardHeader>
      <CardBody>
        <div
          ref={containerRef}
          className={cn('w-full', `h-[${height}px] max-h-[400px] relative`)}
        >
          <svg
            width="100%"
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={hideTooltip}
          >
            {dateScale && operatorsScale && (
              <>
                <GridRows
                  scale={operatorsScale}
                  width={width - margin.left - margin.right}
                  height={height - margin.top - margin.bottom}
                  left={margin.left}
                  top={margin.top}
                  stroke="#7A86A5"
                  strokeOpacity={0.2}
                  numTicks={getNumberOfTicks(width, 'y')}
                  tickValues={operatorsScale.ticks(
                    getNumberOfTicks(width, 'y')
                  )}
                />
                <GridColumns
                  scale={dateScale}
                  width={width - margin.left - margin.right}
                  height={height - margin.top - margin.bottom}
                  left={margin.left}
                  top={margin.top}
                  stroke="#7A86A5"
                  strokeOpacity={0.2}
                  numTicks={getNumberOfTicks(width, 'x')}
                />
                <AxisLeft
                  scale={operatorsScale}
                  top={margin.top - 20}
                  left={margin.left}
                  tickFormat={formatNumberToCompactString}
                  tickLabelProps={() => ({
                    fill: '#7A86A5',
                    fontSize: width < 500 ? 12 : 14,
                    textAnchor: 'end',
                    dy: '0.33em',
                    dx: '-0.33em'
                  })}
                  numTicks={getNumberOfTicks(width, 'y')}
                  tickValues={operatorsScale.ticks(
                    getNumberOfTicks(width, 'y')
                  )}
                />
                <AxisBottom
                  scale={dateScale}
                  top={height - margin.bottom + 30}
                  left={margin.left - 30}
                  tickFormat={date => formatDateToVerboseString(new Date(date))}
                  tickLabelProps={() => ({
                    fill: '#7A86A5',
                    fontSize: width < 500 ? 12 : 14,
                    textAnchor: 'middle'
                  })}
                  tickValues={dateScale.ticks(getNumberOfTicks(width, 'x'))}
                />
                <Group>
                  <LinePath
                    data={sortedData}
                    x={d => dateScale(new Date(d.timestamp))}
                    y={d => operatorsScale(d.operators)}
                    stroke="#009CDD"
                    strokeWidth={2}
                  />
                </Group>
                {tooltipData && (
                  <g>
                    <Circle
                      cx={dateScale(new Date(tooltipData.timestamp)).toString()}
                      cy={operatorsScale(tooltipData.operators).toString()}
                      r={4}
                      className="cursor-pointer"
                      fill="#009CDD"
                      stroke="white"
                      strokeWidth={2}
                    />
                  </g>
                )}
              </>
            )}
          </svg>
          {tooltipOpen && tooltipData && (
            <TooltipInPortal
              key={Math.random()}
              top={tooltipTop + 60}
              left={tooltipLeft - 250}
              className="bg-white p-2 rounded min-w-20 shadow-md text-foreground z-10"
            >
              <div className="text-sm">
                Date:{' '}
                {formatDateToVerboseString(new Date(tooltipData.timestamp))}
              </div>
              <div className="text-base">
                Operators: {tooltipData.operators}
              </div>
            </TooltipInPortal>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default OperatorsOvertime;
