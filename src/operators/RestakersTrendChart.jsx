import { useCallback, useMemo } from 'react';
import { Group } from '@visx/group';
import { scaleLinear, scaleTime } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { Circle, LinePath } from '@visx/shape';
import { extent } from 'd3-array';
import { GridRows, GridColumns } from '@visx/grid';
import { useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { formatDateToVerboseString } from '../utils';

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

const RestakersTrendChart = ({ data, width, height }) => {
  const {
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
    showTooltip,
    hideTooltip
  } = useTooltip();

  const margin = { top: 40, right: 0, bottom: 40, left: 45 };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const getRestakers = d => d.restakers;

  const getRestakersByDate = date => {
    const selectedDate = formatDateToVerboseString(new Date(date));
    const restakers = data.filter(
      item =>
        selectedDate === formatDateToVerboseString(new Date(item.timestamp))
    );
    return restakers[0];
  };

  const dateScale = useMemo(
    () =>
      scaleTime({
        range: [0, innerWidth],
        domain: [
          Math.min(...data.map(d => new Date(d.timestamp))),
          Math.max(...data.map(d => new Date(d.timestamp)))
        ],
        nice: true
      }),
    [data]
  );

  const restakersScale = useMemo(
    () =>
      scaleLinear({
        range: [innerHeight, 0],
        domain: extent(data, getRestakers),
        nice: true
      }),
    [data]
  );

  const handleTooltip = useCallback(
    ev => {
      const { x, y } = localPoint(ev) || { x: 0, y: 0 };
      const date = dateScale.invert(x - margin.left);

      showTooltip({
        tooltipData: getRestakersByDate(date),
        tooltipLeft: x,
        tooltipTop: y
      });
    },
    [localPoint, dateScale, margin, showTooltip, getRestakersByDate]
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
        <Group left={margin.left} top={margin.top}>
          <GridRows
            scale={restakersScale}
            width={innerWidth}
            height={innerHeight - margin.top}
            stroke="#7A86A5"
            strokeOpacity={0.2}
            numTicks={getNumberOfTicks(width, 'y')}
            tickValues={restakersScale.ticks(getNumberOfTicks(width, 'y'))}
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
            scale={restakersScale}
            tickLabelProps={() => ({
              className: 'fill-default-2 text-xs',
              fontSize: 11,
              textAnchor: 'end'
            })}
          />

          <AxisBottom
            scale={dateScale}
            tickFormat={date => formatDateToVerboseString(new Date(date))}
            top={innerHeight}
            tickLabelProps={() => ({
              className: 'fill-default-2 text-xs',
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
            y={d => restakersScale(getRestakers(d)) ?? 0}
          />

          {tooltipData && (
            <g>
              <Circle
                cx={dateScale(new Date(tooltipData.timestamp)).toString()}
                cy={restakersScale(tooltipData.restakers).toString()}
                r={4}
                className="cursor-pointer fill-dark-blue"
                stroke="white"
                strokeWidth={2}
              />
            </g>
          )}
          <rect
            x={0}
            y={0}
            width={innerWidth}
            height={innerHeight}
            onTouchStart={handleTooltip}
            fill={'transparent'}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={hideTooltip}
          />
        </Group>
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
          <div className="text-base">Restakers: {tooltipData.restakers}</div>
        </TooltipWithBounds>
      )}
    </div>
  );
};

export default RestakersTrendChart;
