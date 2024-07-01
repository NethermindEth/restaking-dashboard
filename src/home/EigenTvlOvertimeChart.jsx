import { AxisBottom, AxisLeft } from '@visx/axis';
import { localPoint } from '@visx/event';
import { GridColumns, GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { scaleLinear, scaleTime } from '@visx/scale';
import { Circle, LinePath } from '@visx/shape';
import { TooltipWithBounds, useTooltip } from '@visx/tooltip';
import { extent, max } from 'd3-array';
import { useCallback, useMemo } from 'react';
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

const EigenTvlOvertimeChart = ({ data, width, height }) => {
  const {
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
    showTooltip,
    hideTooltip
  } = useTooltip();

  const margin = { top: 40, right: 60, bottom: 40, left: 60 };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const getEthTVL = d => parseFloat(d.ethTVL);
  const getLstTVL = d => parseFloat(d.lstTVL);

  const getTvlByDate = date => {
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
        domain: extent(data, d => new Date(d.timestamp)),
        nice: true
      }),
    [data, innerWidth]
  );

  const tvlScale = useMemo(
    () =>
      scaleLinear({
        range: [innerHeight, 0],
        domain: [0, max(data, d => Math.max(getEthTVL(d), getLstTVL(d)))],
        nice: true
      }),
    [data, innerHeight]
  );

  const handleTooltip = useCallback(
    event => {
      const { x, y } = localPoint(event) || { x: 0, y: 0 };
      const date = dateScale.invert(x - margin.left);

      showTooltip({
        tooltipData: getTvlByDate(date),
        tooltipLeft: x,
        tooltipTop: y
      });
    },
    [dateScale, margin.left, showTooltip, getTvlByDate]
  );

  return (
    <div>
      <svg width={width} height={height}>
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
            height={innerHeight}
            stroke="#7A86A5"
            strokeOpacity={0.2}
            numTicks={getNumberOfTicks(width, 'y')}
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
            scale={tvlScale}
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
            className="stroke-blue-500"
            strokeWidth={2}
            data={data}
            x={d => dateScale(new Date(d.timestamp))}
            y={d => tvlScale(getEthTVL(d))}
          />

          <LinePath
            className="stroke-green-500"
            strokeWidth={2}
            data={data}
            x={d => dateScale(new Date(d.timestamp))}
            y={d => tvlScale(getLstTVL(d))}
          />

          {tooltipData && (
            <>
              <Circle
                cx={dateScale(new Date(tooltipData.timestamp))}
                cy={tvlScale(getEthTVL(tooltipData))}
                r={4}
                className="fill-blue-500"
                stroke="white"
                strokeWidth={2}
              />
              <Circle
                cx={dateScale(new Date(tooltipData.timestamp))}
                cy={tvlScale(getLstTVL(tooltipData))}
                r={4}
                className="fill-green-500"
                stroke="white"
                strokeWidth={2}
              />
            </>
          )}
          <rect
            x={0}
            y={0}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
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
          <div className="text-base text-blue-500">
            ETH TVL: {tooltipData.ethTVL}
          </div>
          <div className="text-base text-green-500">
            LST TVL: {tooltipData.lstTVL}
          </div>
        </TooltipWithBounds>
      )}
    </div>
  );
};

export default EigenTvlOvertimeChart;
