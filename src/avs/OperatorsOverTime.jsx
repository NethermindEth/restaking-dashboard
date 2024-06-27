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
import React, { useCallback, useEffect, useMemo } from 'react';
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

const OperatorsOverTime = ({ avsAddress }) => {
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

  const bisectDate = bisector(d => new Date(d.date)).left;

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

  const sortData = (data, tab) => {
    switch (tab) {
      case '7days':
        return data.slice(-7);
      case '30days':
        return data.slice(-30);
      default:
        return data;
    }
  };

  const sortedData = useMemo(() => {
    if (!graphData) return null;
    return sortData(graphData, timelineTab);
  }, [graphData, timelineTab]);

  const margin = getMargin(width);

  const xScale = useMemo(() => {
    if (!sortedData) return null;
    return scaleTime({
      domain: [
        Math.min(...sortedData.map(d => new Date(d.date))),
        Math.max(...sortedData.map(d => new Date(d.date)))
      ],
      range: [margin.left, width - margin.right]
    });
  }, [sortedData, width, margin]);

  const yScale = useMemo(() => {
    if (!sortedData) return null;
    const maxValue = Math.max(...sortedData.map(d => d.count));
    const minValue = Math.min(...sortedData.map(d => d.count));

    // create artificial range if all values same
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
      if (!sortedData || !xScale || !yScale) return;

      const { x } = localPoint(event) || { x: 0 };
      const x0 = xScale.invert(x);
      const index = bisectDate(sortedData, x0, 1);
      const d0 = sortedData[index - 1];
      const d1 = sortedData[index];
      let d = d0;
      if (d1 && d1.date) {
        d = x0 - new Date(d0.date) > new Date(d1.date) - x0 ? d1 : d0;
      }

      showTooltip({
        tooltipData: d,
        tooltipLeft: x,
        tooltipTop: yScale(d.count)
      });
    },
    [showTooltip, sortedData, xScale, yScale, bisectDate]
  );

  return (
    <Card
      radius="md"
      className="bg-content1 border border-outline p-4 relative"
    >
      <CardHeader className="flex items-end flex-wrap justify-between gap-3">
        {' '}
        <div className="font-light text-lg text-foreground-1">
          Operators over time
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
            {xScale && yScale && (
              <>
                <GridRows
                  scale={yScale}
                  width={width - margin.left - margin.right}
                  height={height - margin.top - margin.bottom}
                  left={margin.left}
                  top={margin.top}
                  stroke="#7A86A5"
                  strokeOpacity={0.2}
                  numTicks={getNumberOfTicks(width, 'y')}
                  tickValues={yScale.ticks(getNumberOfTicks(width, 'y'))}
                />
                <GridColumns
                  scale={xScale}
                  width={width - margin.left - margin.right}
                  height={height - margin.top - margin.bottom}
                  left={margin.left}
                  top={margin.top}
                  stroke="#7A86A5"
                  strokeOpacity={0.2}
                  numTicks={getNumberOfTicks(width, 'x')}
                />
                <AxisLeft
                  scale={yScale}
                  top={margin.top}
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
                  tickValues={yScale.ticks(getNumberOfTicks(width, 'y'))}
                />
                <AxisBottom
                  scale={xScale}
                  top={height - margin.bottom + 30}
                  left={margin.left - 30}
                  tickFormat={date => formatDateToVerboseString(new Date(date))}
                  tickLabelProps={() => ({
                    fill: '#7A86A5',
                    fontSize: width < 500 ? 12 : 14,
                    textAnchor: 'middle'
                  })}
                  tickValues={xScale.ticks(getNumberOfTicks(width, 'x'))}
                />
                <Group>
                  <LinePath
                    data={sortedData}
                    x={d => xScale(new Date(d.date))}
                    y={d => yScale(d.count)}
                    stroke="#009CDD"
                    strokeWidth={2}
                  />
                </Group>
                {tooltipData && (
                  <g>
                    <Circle
                      cx={xScale(new Date(tooltipData.date)).toString()}
                      cy={yScale(tooltipData.count).toString()}
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
              top={tooltipTop}
              left={tooltipLeft}
              className="bg-white p-2 rounded min-w-40 shadow-md text-foreground z-10"
            >
              <div className="text-sm">
                Date: {formatDateToVerboseString(new Date(tooltipData.date))}
              </div>
              <div className="text-base">Count: {tooltipData.count}</div>
            </TooltipInPortal>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default OperatorsOverTime;
