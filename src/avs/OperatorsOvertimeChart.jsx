import { AxisBottom, AxisLeft } from '@visx/axis';
import { localPoint } from '@visx/event';
import { GridColumns, GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { scaleLinear, scaleTime } from '@visx/scale';
import { Circle, LinePath } from '@visx/shape';
import { TooltipWithBounds, useTooltip } from '@visx/tooltip';
import { bisector } from 'd3-array';
import { useCallback, useMemo } from 'react';
import { formatDateToVerboseString, formatNumber } from '../utils';

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

const OperatorsOvertimeChart = ({ data, width, height }) => {
  const {
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
    showTooltip,
    hideTooltip
  } = useTooltip();

  const margin = useMemo(
    () => ({ top: 0, right: 40, bottom: 40, left: 20 }),
    []
  );

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const getOperators = d => d.operators;

  const dateScale = useMemo(() => {
    if (!data || data.length === 0) return null;
    const dates = data.map(d => new Date(d.timestamp)).filter(d => !isNaN(d));
    if (dates.length === 0) return null;
    return scaleTime({
      domain: [Math.min(...dates), Math.max(...dates)],
      range: [margin.left, width - margin.right]
    });
  }, [data, width, margin]);

  const operatorsScale = useMemo(() => {
    if (!data || data.length === 0) return null;
    const operators = data.map(d => d.operators).filter(o => !isNaN(o));
    if (operators.length === 0) return null;
    const maxValue = Math.max(...operators);
    const minValue = Math.min(...operators);

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
  }, [data, height, margin]);

  const handleTooltip = useCallback(
    ev => {
      const { x } = localPoint(ev) || { x: 0, y: 0 };
      const x0 = dateScale.invert(x - margin.left);

      // find the nearest data point
      const bisectDate = bisector(d => new Date(d.timestamp)).left;
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      const d =
        d0 && d1 && x0 - new Date(d0.timestamp) > new Date(d1.timestamp) - x0
          ? d1
          : d0;

      if (d) {
        showTooltip({
          tooltipData: d,
          tooltipLeft: dateScale(new Date(d.timestamp)) + margin.left,
          tooltipTop: operatorsScale(d.operators)
        });
      }
    },
    [data, dateScale, operatorsScale, margin, showTooltip]
  );

  return (
    <div>
      <svg width={width} height={height} className="overflow-visible">
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          className="fill-content1"
          rx={14}
        />
        {dateScale && operatorsScale && (
          <Group left={margin.left} top={margin.top}>
            <GridRows
              scale={operatorsScale}
              width={innerWidth}
              height={innerHeight - margin.top}
              stroke="#7A86A5"
              strokeOpacity={0.2}
              numTicks={getNumberOfTicks(width, 'y')}
              tickValues={operatorsScale.ticks(getNumberOfTicks(width, 'y'))}
            />
            <GridColumns
              scale={dateScale}
              width={innerWidth}
              height={innerHeight}
              stroke="#7A86A5"
              strokeOpacity={0.2}
              numTicks={getNumberOfTicks(width, 'x')}
            />

            <AxisLeft
              left={margin.left}
              tickFormat={formatNumber}
              scale={operatorsScale}
              tickLabelProps={() => ({
                className: 'fill-foreground-2 text-xs',
                textAnchor: 'end',
                dy: '0.33em',
                dx: '-0.33em'
              })}
            />

            <AxisBottom
              left={0}
              scale={dateScale}
              tickFormat={date => formatDateToVerboseString(new Date(date))}
              top={innerHeight}
              tickLabelProps={() => ({
                className: 'fill-foreground-2 text-xs',
                textAnchor: 'middle'
              })}
              tickValues={data
                .filter(
                  (_, i) =>
                    i %
                      Math.max(
                        1,
                        Math.floor(data.length / getNumberOfTicks(width, 'x'))
                      ) ===
                    0
                )
                .map(d => new Date(d.timestamp))}
            />

            <LinePath
              className="stroke-dark-blue"
              strokeWidth={2}
              data={data}
              x={d => dateScale(new Date(d.timestamp))}
              y={d => operatorsScale(getOperators(d)) ?? 0}
            />

            {tooltipData && (
              <g>
                <Circle
                  cx={tooltipLeft - margin.left}
                  cy={tooltipTop}
                  r={4}
                  className="cursor-pointer fill-dark-blue"
                  stroke="white"
                  strokeWidth={2}
                />
              </g>
            )}
            <rect
              x={margin.left}
              y={margin.top}
              width={innerWidth}
              height={innerHeight}
              onTouchStart={handleTooltip}
              onTouchMove={handleTooltip}
              onMouseMove={handleTooltip}
              onMouseLeave={hideTooltip}
              fill="transparent"
            />
          </Group>
        )}
      </svg>
      {tooltipData && (
        <TooltipWithBounds
          key={Math.random()}
          top={tooltipTop + 10}
          left={tooltipLeft}
          className="z-10 min-w-40 rounded bg-white p-2 text-foreground shadow-md"
        >
          <div className="text-sm">
            Date: {formatDateToVerboseString(new Date(tooltipData.timestamp))}
          </div>
          <div className="text-base">
            Operators: {formatNumber(tooltipData.operators)}
          </div>
        </TooltipWithBounds>
      )}
    </div>
  );
};

export default OperatorsOvertimeChart;
