import { AreaClosed, Circle, LinePath } from '@visx/shape';
import { AxisBottom, AxisRight } from '@visx/axis';
import { formatETH, formatNumber, formatUSD } from '../../shared/formatters';
import {
  getGrowthPercentage,
  handleServiceError,
  reduceState
} from '../../shared/helpers';
import { scaleLinear, scaleUtc } from '@visx/scale';
import { Spinner, Tab, Tabs, Tooltip } from '@nextui-org/react';
import { tabs, tooltip } from '../../shared/slots';
import { useCallback, useEffect, useMemo } from 'react';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { bisector } from '@visx/vendor/d3-array';
import { curveMonotoneX } from '@visx/curve';
import ErrorMessage from '../../shared/ErrorMessage';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { LinearGradient } from '@visx/gradient';
import { localPoint } from '@visx/event';
import { ParentSize } from '@visx/responsive';
import { useMutativeReducer } from 'use-mutative';
import { useParams } from 'react-router-dom';
import { useServices } from '../../@services/ServiceContext';
import { useTailwindBreakpoint } from '../../shared/hooks/useTailwindBreakpoint';

export default function OperatorTVLLineChart({
  currentTVL,
  ethRate,
  isOperatorLoading,
  operatorError
}) {
  const { address } = useParams();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    error: undefined,
    isChartLoading: true,
    points: undefined
  });
  const { operatorService } = useServices();

  useEffect(() => {
    dispatch({ isChartLoading: true, error: undefined });
    (async () => {
      try {
        const response = await operatorService.getOperatorTVL(address);

        dispatch({
          points: response,
          isChartLoading: false
        });
      } catch (e) {
        dispatch({ isChartLoading: false, error: handleServiceError(e) });
      }
    })();
  }, [address, dispatch, operatorService]);

  // our endpoint only returns up to yesterdays data. We need to append today's data point
  // into the graph
  const currentPoint = useMemo(
    () => ({
      timestamp: new Date(),
      // use current eth rate as "historical" rate
      rate: ethRate,
      tvl: currentTVL
    }),
    [ethRate, currentTVL]
  );

  return (
    <div>
      {isOperatorLoading ||
      state.isChartLoading ||
      state.error ||
      operatorError ? (
        <div className="rd-box mb-4 flex h-[390px] w-full items-center justify-center p-4">
          {operatorError || state.error ? (
            <ErrorMessage error={operatorError ?? state.error} />
          ) : (
            <Spinner color="primary" size="lg" />
          )}
        </div>
      ) : (
        <ParentSize className="mb-4">
          {parent => (
            <LineChart
              height={288}
              points={
                new Date().getUTCHours() < 12 // API returns today's data after 12:00 PM UTC. Check if current time is earlier than 12 pm.
                  ? state.points.concat(currentPoint)
                  : state.points
              }
              width={parent.width}
            />
          )}
        </ParentSize>
      )}
    </div>
  );
}

function LineChart({ points, height, width }) {
  const compact = !useTailwindBreakpoint('sm');

  const [state, dispatch] = useMutativeReducer(reduceState, {
    filteredPoints: [],
    maxX: 0,
    maxY: 0,
    useRate: true
  });

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
        Math.max(...state.filteredPoints.map(getValue)) * 1.1
      ],
      range: [state.maxY, 0]
    });
  }, [state.filteredPoints, state.maxY, getValue]);

  const getLatestTotals = useMemo(() => {
    const latest = points[points.length - 1];

    return state.useRate
      ? formatUSD(latest.tvl * latest.rate, compact)
      : formatETH(latest.tvl, compact);
  }, [compact, points, state.useRate]);

  const growthPercentage = useMemo(() => {
    if (!state.filteredPoints.length) {
      return null;
    }

    const first = state.filteredPoints[0];
    const latest = state.filteredPoints[state.filteredPoints.length - 1];

    return getGrowthPercentage(
      state.useRate ? first.tvl * first.rate : first.tvl,
      state.useRate ? latest.tvl * latest.rate : latest.tvl
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
    [getValue, showTooltip, scaleDate, scaleValue, state.filteredPoints]
  );

  useEffect(() => {
    dispatch({
      maxX: Math.max(width - margin.left - margin.right, 0),
      maxY: height - margin.top - margin.bottom
    });
  }, [dispatch, width, height]);

  useEffect(() => {
    if (state.maxX > 0 && !state.filteredPoints.length) {
      handleTimelineSelectionChange(TIMELINE_DEFAULT);
    }
  }, [handleTimelineSelectionChange, state.filteredPoints, state.maxX]);

  return (
    <div className="rd-box p-4">
      <div className="mb-6 flex flex-wrap justify-end gap-x-2 gap-y-4 sm:justify-between">
        <div className="flex-1">
          <div className="flex content-center text-base text-foreground-1">
            TVL over time
            <Tooltip
              classNames={tooltip}
              content={
                <>
                  Due to the expanding pool of Liquid Staking Tokens (LST) and
                  Liquid Restaking Tokens (LRT), the TVL value on this dashboard
                  may not always match the actual TVL of the entire token pool.
                  Refer to the dashboard token list for the current LST and LRT
                  data included in the TVL calculation.
                </>
              }
              isOpen={state.showTVLTooltip}
              onOpenChange={open => dispatch({ showTVLTooltip: open })}
              placement="bottom"
              showArrow="true"
            >
              <span
                className="material-symbols-outlined ms-2 cursor-pointer text-base"
                onPointerDown={() =>
                  dispatch({ showTVLTooltip: !state.showTVLTooltip })
                }
                style={{
                  fontVariationSettings: `'FILL' 0`
                }}
              >
                info
              </span>
            </Tooltip>
          </div>
          <div className="flex gap-x-2 text-sm text-foreground-2">
            <span>{getLatestTotals}</span>
            <span
              className={`${growthPercentage >= 0 ? 'text-success' : 'text-danger'}`}
            >
              {growthPercentage > 0 && '+'}
              {formatNumber(growthPercentage, false)}%
            </span>
          </div>
        </div>
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
          defaultSelectedKey={TIMELINE_DEFAULT}
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

      <svg
        className="w-full touch-pan-y"
        height={height}
        ref={containerRef}
        width={width}
      >
        <LinearGradient
          from="hsl(var(--app-chart-9))"
          fromOpacity={0.5}
          id="area-gradient"
          to="hsl(var(--app-chart-9))"
          toOpacity={0}
        />
        <Group left={margin.left} top={margin.top}>
          <GridRows
            className="opacity-25 [&_line]:stroke-foreground-2"
            height={state.maxY}
            numTicks={4}
            scale={scaleValue}
            width={state.maxX - margin.right}
          />
          <AreaClosed
            curve={curveMonotoneX}
            data={state.filteredPoints}
            fill="url(#area-gradient)"
            x={d => scaleDate(getDate(d)) ?? 0}
            y={d => scaleValue(getValue(d)) ?? 0}
            yScale={scaleValue}
          />
          <LinePath
            className="stroke-chart-9 stroke-2"
            curve={curveMonotoneX}
            data={state.filteredPoints}
            strokeLinecap="butt"
            x={d => scaleDate(getDate(d)) ?? 0}
            y={d => scaleValue(getValue(d)) ?? 0}
          />
          <AxisRight
            axisLineClassName="stroke-foreground-2"
            left={state.maxX - margin.right}
            numTicks={4}
            scale={scaleValue}
            tickClassName="[&_line]:stroke-foreground-2"
            tickFormat={v => formatNumber(v, true)}
            tickLabelProps={{
              className: 'text-xs',
              fill: 'hsl(var(--app-foreground-1))',
              fontFamily: undefined,
              fontSize: undefined
            }}
          />
          <AxisBottom
            axisLineClassName="stroke-foreground-2"
            numTicks={Math.floor(state.maxX / 120)}
            scale={scaleDate}
            tickClassName="[&_line]:stroke-foreground-2"
            tickFormat={formatDate}
            tickLabelProps={{
              className: 'text-xs',
              fill: 'hsl(var(--app-foreground-1))',
              fontFamily: undefined,
              fontSize: undefined
            }}
            top={state.maxY}
          />
          {tooltipOpen && (
            <Circle
              className="cursor-pointer fill-chart-9 stroke-2 dark:stroke-foreground"
              cx={tooltipLeft}
              cy={tooltipTop}
              r={4}
            />
          )}

          <rect
            fill="transparent"
            height={state.maxY}
            onPointerEnter={handlePointerMove}
            onPointerLeave={hideTooltip}
            onPointerMove={handlePointerMove}
            width={Math.max(state.maxX - margin.right, 0)}
            x={0}
            y={0}
          />
        </Group>
      </svg>

      {tooltipOpen && (
        <TooltipInPortal
          applyPositionStyle={true}
          className="rd-tooltip px-2"
          key={Math.random()}
          left={tooltipLeft + 25}
          top={tooltipTop + 15}
          unstyled={true}
        >
          <div className="rd-tooltip-title">
            {tooltipDateFormatter.format(new Date(tooltipData.timestamp))}
          </div>
          <div>
            {state.useRate
              ? formatUSD(tooltipData.tvl * tooltipData.rate, compact)
              : formatETH(tooltipData.tvl, compact)}
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}

const margin = { top: 20, right: 40, bottom: 30, left: 0 };
const TIMELINE_DEFAULT = 'all';
const timelines = {
  '1w': 7,
  '1m': 30,
  '3m': 90,
  '1y': 365,
  all: Number.MAX_SAFE_INTEGER
};

// eslint-disable-next-line no-undef
const axisDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short'
});

// eslint-disable-next-line no-undef
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
