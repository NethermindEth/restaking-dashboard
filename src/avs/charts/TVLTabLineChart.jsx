import { scaleUtc, scaleLinear } from '@visx/scale';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../../shared/helpers';
import { Group } from '@visx/group';
import { GridColumns, GridRows } from '@visx/grid';
import { Circle, LinePath } from '@visx/shape';
import { Tab, Tabs } from '@nextui-org/react';
import { tabs } from '../../shared/slots';
import { AxisBottom, AxisRight } from '@visx/axis';
import { formatNumber, getGrowthPercentage } from '../../utils';
import { localPoint } from '@visx/event';
import { bisector } from '@visx/vendor/d3-array';
import { formatETH, formatUSD } from '../../shared/formatters';
import { useTailwindBreakpoint } from '../../shared/useTailwindBreakpoint';

const margin = { top: 20, right: 40, bottom: 40, left: 20 };
const timelines = {
  '1w': 7,
  '1m': 30,
  '3m': 90,
  '1y': 365,
  all: Number.MAX_SAFE_INTEGER
};

const axisDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short'
});

const tooltipDateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
});
const formatDate = date => {
  if (date.getMonth() == 0 && date.getDate() == 1) {
    return date.getFullYear();
  }

  return axisDateFormatter.format(date);
};
const calculateDisabledTimelines = totalPoints => {
  const disabled = [];
  for (const timeline in timelines) {
    if (timeline !== 'all' && timelines[timeline] > totalPoints) {
      disabled.push(timeline);
    }
  }

  return disabled;
};
const getDate = d => new Date(d.timestamp);
const bisectDate = bisector(getDate).left;

export default function TVLTabLineChart({ points, height, width }) {
  const compact = !useTailwindBreakpoint('sm');

  const [state, dispatch] = useMutativeReducer(reduceState, {
    filteredPoints: points,
    maxX: Math.max(width - margin.left - margin.right, 0),
    maxY: height - margin.top - margin.bottom,
    useRate: true
  });

  useEffect(() => {
    dispatch({
      filteredPoints: points
    });
  }, [points]);

  useEffect(() => {
    dispatch({
      maxX: Math.max(width - margin.left - margin.right, 0),
      maxY: height - margin.top - margin.bottom
    });
  }, [dispatch, width, height]);

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true
  });

  const {
    hideTooltip,
    showTooltip,
    tooltipData,
    tooltipLeft,
    tooltipOpen,
    tooltipTop
  } = useTooltip();

  const getValue = useCallback(
    d => (state.useRate ? d.tvl * d.rate : d.tvl),
    [state.useRate]
  );

  const scaleDate = useMemo(() => {
    return scaleUtc({
      domain: [
        Math.min(...state.filteredPoints.map(getDate)),
        Math.max(...state.filteredPoints.map(getDate))
      ],
      // give some space for the right axis labels
      range: [0, state.maxX - margin.right]
    });
  }, [state.filteredPoints, state.maxX]);

  const scaleValue = useMemo(() => {
    return scaleLinear({
      domain: [
        Math.min(...state.filteredPoints.map(getValue)),
        Math.max(...state.filteredPoints.map(getValue))
      ],
      range: [state.maxY, 0]
    });
  }, [state.filteredPoints, state.maxY, getValue]);

  const getLatestTotals = useMemo(() => {
    const latest = points[points.length - 1];

    return state.useRate
      ? formatUSD(latest.tvl * latest.rate, compact)
      : formatETH(latest.tvl, compact);
  }, [points, state.useRate]);

  const growthPercentage = useMemo(() => {
    const first = state.filteredPoints[0];
    const lastest = state.filteredPoints[state.filteredPoints.length - 1];

    return getGrowthPercentage(
      state.useRate ? first.tvl * first.rate : first.tvl,
      state.useRate ? lastest.tvl * lastest.rate : lastest.tvl
    );
  }, [state.filteredPoints, state.useRate]);

  const disabledKeys = useMemo(
    () => calculateDisabledTimelines(points.length),
    [points]
  );

  const handleTimelineSelectionChange = useCallback(
    key => {
      const start = Math.max(0, points.length - 1 - timelines[key]);
      dispatch({
        filteredPoints: points.slice(start)
      });
    },
    [points, dispatch]
  );
  const handleRateSelectionChange = useCallback(
    key => {
      dispatch({ useRate: key === 'usd' });
    },
    [dispatch]
  );
  const handlePointerMove = useCallback(
    event => {
      const point = localPoint(event.target.ownerSVGElement, event);
      const x = scaleDate.invert(point.x - margin.left);
      const index = bisectDate(state.filteredPoints, x, 1);
      const d0 = state.filteredPoints[index - 1];
      const d1 = state.filteredPoints[index];
      let d = d0;
      if (d1) {
        d =
          x.getTime() - getDate(d0).getTime() >
          getDate(d1).getTime() - x.getTime()
            ? d1
            : d0;
      }

      showTooltip({
        tooltipData: d,
        tooltipLeft: scaleDate(getDate(d)),
        tooltipTop: scaleValue(getValue(d))
      });
    },
    [scaleDate, scaleValue, state.filteredPoints]
  );

  return (
    <div className="bg-content1 border border-outline rounded-lg">
      <div className="flex justify-between mb-6 p-4">
        <div className="flex-1 hidden sm:block">
          <div className="font-display text-foreground-1 text-xl">
            TVL overtime
          </div>
          <div className="flex gap-x-2 text-foreground-2 text-xs">
            <span>{getLatestTotals}</span>
            <span
              className={`${growthPercentage >= 0 ? 'text-success' : 'text-danger'}`}
            >
              {growthPercentage > 0 && '+'}
              {formatNumber(growthPercentage, false)}%
            </span>
          </div>
        </div>

        <div className="flex flex-1 w-full flex-col gap-y-2 justify-between sm:flex-row sm:justify-end gap-x-2">
          <Tabs
            classNames={tabs}
            defaultSelectedKey="usd"
            onSelectionChange={handleRateSelectionChange}
            size="sm"
          >
            <Tab key="usd" title="USD" />
            <Tab key="eth" title="ETH" />
          </Tabs>
          <Tabs
            classNames={tabs}
            defaultSelectedKey="all"
            disabledKeys={disabledKeys}
            onSelectionChange={handleTimelineSelectionChange}
            size="sm"
          >
            <Tab key="1w" title="1W" />
            <Tab key="1m" title="1M" />
            <Tab key="3m" title="3M" />
            <Tab key="1y" title="1Y" />
            <Tab key="all" title="All" />
          </Tabs>
        </div>
      </div>

      <svg
        className="touch-pan-y w-full"
        ref={containerRef}
        width={width}
        height={height}
      >
        <Group left={margin.left} top={margin.top}>
          <GridRows
            scale={scaleValue}
            width={state.maxX - margin.right}
            height={state.maxY}
            numTicks={4}
            className="[&_line]:stroke-foreground-2 opacity-25"
          />
          <GridColumns
            scale={scaleDate}
            width={state.maxX}
            height={state.maxY}
            numTicks={Math.floor(state.maxX / 120)}
            className="[&_line]:stroke-foreground-2 opacity-25"
          />
          <AxisRight
            left={state.maxX - margin.right}
            scale={scaleValue}
            numTicks={4}
            tickFormat={v => formatNumber(v, true)}
            axisLineClassName="stroke-foreground-2"
            tickClassName="[&_line]:stroke-foreground-2"
            tickLabelProps={{
              className: 'text-xs',
              fill: 'hsl(var(--app-foreground))'
            }}
          />
          <AxisBottom
            top={state.maxY}
            scale={scaleDate}
            numTicks={Math.floor(state.maxX / 120)}
            tickFormat={formatDate}
            axisLineClassName="stroke-foreground-2"
            tickClassName="[&_line]:stroke-foreground-2"
            tickLabelProps={{
              className: 'text-xs',
              fill: 'hsl(var(--app-foreground))'
            }}
          />
          <LinePath
            className="stroke-dark-blue"
            data={state.filteredPoints}
            x={d => scaleDate(getDate(d)) ?? 0}
            y={d => scaleValue(getValue(d)) ?? 0}
          />

          {tooltipOpen && (
            <g>
              <Circle
                cx={tooltipLeft}
                cy={tooltipTop}
                r={4}
                className="cursor-pointer fill-dark-blue stroke-white stroke-2"
              />
            </g>
          )}

          <rect
            x={0}
            y={0}
            width={Math.max(state.maxX - margin.right, 0)}
            height={state.maxY}
            onPointerEnter={handlePointerMove}
            onPointerMove={handlePointerMove}
            onPointerLeave={hideTooltip}
            fill="transparent"
          />
        </Group>
      </svg>

      {tooltipOpen && (
        <TooltipInPortal
          key={Math.random()}
          applyPositionStyle={true}
          className="backdrop-blur bg-white/75 dark:bg-black/75 p-2 rounded min-w-40 shadow-md text-foreground"
          left={tooltipLeft + 25}
          top={tooltipTop + 15}
          unstyled={true}
        >
          <div className="font-bold mb-2 px-2 text-sm">
            {tooltipDateFormatter.format(new Date(tooltipData.timestamp))}
          </div>
          <div className="text-base px-2">
            {state.useRate
              ? formatUSD(tooltipData.tvl * tooltipData.rate, compact)
              : formatETH(tooltipData.tvl, compact)}
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}
