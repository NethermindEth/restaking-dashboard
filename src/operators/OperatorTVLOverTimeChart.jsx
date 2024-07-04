import { useCallback, useMemo } from 'react';
import { Group } from '@visx/group';
import { scaleLinear, scaleTime } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { Circle, LinePath } from '@visx/shape';
import { extent } from 'd3-array';
import { GridRows, GridColumns } from '@visx/grid';
import { useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { formatNumber, formatDateToVerboseString } from '../utils';

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

const OperatorTVLOverTimeChart = ({ data, width, height }) => {
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

  const getTVL = d => d.tvl;

  const getTVLByDate = date => {
    const selectedDate = formatDateToVerboseString(new Date(date));
    const tvl = data.filter(
      item =>
        selectedDate === formatDateToVerboseString(new Date(item.timestamp))
    );
    return tvl[0];
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

  const tvlScale = useMemo(() => {
    const maxValue = Math.max(...data.map(d => d.tvl));
    const minValue = Math.min(...data.map(d => d.tvl));
    const yDomain = [minValue, maxValue + (maxValue - minValue) * 0.1];

    return scaleLinear({
      domain: yDomain,
      range: [innerHeight, 0],
      nice: true
    });
  }, [data, height, margin]);

  const handleTooltip = useCallback(
    ev => {
      const { x, y } = localPoint(ev) || { x: 0, y: 0 };
      const date = dateScale.invert(x - margin.left);

      showTooltip({
        tooltipData: getTVLByDate(date),
        tooltipLeft: x,
        tooltipTop: y
      });
    },
    [localPoint, dateScale, margin, showTooltip, getTVLByDate]
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
            scale={tvlScale}
            width={innerWidth}
            height={innerHeight - margin.top}
            stroke="#7A86A5"
            strokeOpacity={0.2}
            numTicks={getNumberOfTicks(width, 'y')}
            tickValues={tvlScale.ticks(getNumberOfTicks(width, 'y'))}
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
            tickFormat={val => formatNumber(val, true)}
            scale={tvlScale}
            tickLabelProps={() => ({
              className: 'fill-default-2 text-xs',
              textAnchor: 'end',
              dy: '0.33em',
              dx: '-0.33em'
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
            y={d => tvlScale(getTVL(d)) ?? 0}
          />

          {tooltipData && (
            <g>
              <Circle
                cx={dateScale(new Date(tooltipData.timestamp)).toString()}
                cy={tvlScale(tooltipData.tvl).toString()}
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
          className="bg-white p-2 rounded min-w-40 shadow-md text-foreground z-10"
        >
          <div className="text-sm">
            Date: {formatDateToVerboseString(new Date(tooltipData.timestamp))}
          </div>
          <div className="text-base">
            TVL: {formatNumber(tooltipData.tvl, true)}
          </div>
        </TooltipWithBounds>
      )}
    </div>
  );
};

export default OperatorTVLOverTimeChart;
