import { AreaClosed, AreaStack } from '@visx/shape';
import { AxisBottom, AxisRight } from '@visx/axis';
import { formatETH, formatNumber, formatUSD } from '../shared/formatters';
import { scaleLinear, scaleUtc } from '@visx/scale';
import { Tab, Tabs, Tooltip } from '@nextui-org/react';
import { tabs, tooltip } from '../shared/slots';
import { useCallback, useEffect, useMemo } from 'react';
import { allStrategyAssetMapping } from '../shared/strategies';
import { bisector } from '@visx/vendor/d3-array';
import { curveMonotoneX } from '@visx/curve';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import HBrush from '../shared/HBrush';
import { localPoint } from '@visx/event';
import { reduceState } from '../shared/helpers';
import { useMutativeReducer } from 'use-mutative';
import { useTooltip } from '@visx/tooltip';
import { useTooltipInPortal } from '@visx/tooltip';

export default function LSTDistribution({ rankings, height, width, points }) {
  const [state, dispatch] = useMutativeReducer(reduceState, {
    brushData: [],
    error: undefined,
    filteredPoints: [],
    keys: [],
    maxX: 0,
    maxY: 0,
    useRate: true
  });

  useEffect(() => {
    dispatch({
      maxX: width - margin.left - margin.right,
      maxY: height - margin.top - margin.bottom
    });
  }, [dispatch, height, width]);

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
  const scaleBrushDate = useMemo(() => {
    return scaleUtc({
      domain: [
        Math.min(...points.map(getDate)),
        Math.max(...points.map(getDate))
      ],
      range: [0, state.maxX - margin.right - 2] // y-axis and 2 for brush borders
    });
  }, [points, state.maxX]);
  const scaleBrushValue = useMemo(
    () =>
      scaleLinear({
        domain: [
          0,
          Math.max(
            ...state.brushData.map(d => {
              return d.value * (state.useRate ? d.rate : 1);
            })
          )
        ],
        nice: true,
        range: [brushSize.height - 2, 0] // 2 for brush borders
      }),
    [state.brushData, state.useRate]
  );
  const scaleDate = useMemo(
    () =>
      scaleUtc({
        domain: [
          Math.min(...state.filteredPoints.map(getDate)),
          Math.max(...state.filteredPoints.map(getDate))
        ],
        range: [0, state.maxX - margin.right]
      }),
    [state.filteredPoints, state.maxX]
  );
  const scaleValue = useMemo(
    () =>
      scaleLinear({
        domain: [
          0,
          Math.max(
            ...state.filteredPoints.map(d => {
              let value = 0;

              for (let strategy of d.strategies) {
                value += strategy.value;
              }

              return value * (state.useRate ? d.rate : 1);
            })
          ) * 1.2 // 20% padding
        ],
        nice: true,
        range: [state.maxY - brushSize.marginTop - margin.bottom, 0]
      }),
    [state.useRate, state.filteredPoints, state.maxY]
  );

  const getValue = useCallback(
    (d, strategy) =>
      (d.strategies.find(s => s.address === strategy)?.value ?? 0) *
      (state.useRate ? d.rate : 1),
    [state.useRate]
  );

  const handleBrushChange = useCallback(
    domain => {
      const { x0, x1 } = domain;
      const filtered = points.filter(s => {
        return s.timestamp >= x0 && s.timestamp <= x1;
      });

      dispatch({ brushPosition: null, filteredPoints: filtered });
    },
    [dispatch, points]
  );
  const handleAreaPointerMove = useCallback(
    (event, stack) => {
      const point = localPoint(event.target.ownerSVGElement, event);
      const x = scaleDate.invert(point.x - margin.left).getTime();
      const index = bisectDate(stack, x, 1);
      const x0 = stack[index - 1].data.timestamp;
      const x1 = stack[index].data.timestamp;
      const i = x - x0 > x1 - x ? index : index - 1;

      showTooltip({
        tooltipData: { key: stack.key, data: stack[i].data, x },
        tooltipLeft: point.x,
        tooltipTop: point.y
      });
    },
    [showTooltip, scaleDate]
  );

  const getLatestTotal = useMemo(() => {
    const latest = points[points.length - 1];

    let total = 0;

    for (const strategy of latest.strategies) {
      total += strategy.value;
    }

    return state.useRate ? formatUSD(total * latest.rate) : formatETH(total);
  }, [points, state.useRate]);

  const handleTimelineSelectionChange = useCallback(
    key => {
      const start = Math.max(0, points.length - 1 - timelines[key]);
      dispatch({
        filteredPoints: points.slice(start),
        brushPosition: {
          start: scaleBrushDate(points[start].timestamp),
          end: scaleBrushDate(points[points.length - 1].timestamp)
        }
      });
    },
    [dispatch, points, scaleBrushDate]
  );
  const handleRateSelectionChange = useCallback(
    key => {
      dispatch({ useRate: key === 'usd' });
    },
    [dispatch]
  );

  useEffect(() => {
    dispatch({
      brushData: points?.map(d => {
        let value = 0;

        for (let strategy of d.strategies) {
          value += strategy.value;
        }

        return { timestamp: d.timestamp, value, rate: d.rate };
      }),
      keys: rankings.map(ranking => ranking.address)
    });
  }, [dispatch, points, rankings, scaleBrushDate]);

  useEffect(() => {
    if (state.maxX > 0 && !state.filteredPoints.length) {
      handleTimelineSelectionChange(TIMELINE_DEFAULT);
    }
  }, [handleTimelineSelectionChange, state.filteredPoints, state.maxX]);

  return (
    <div>
      <div className="rd-box basis-full p-4 text-sm">
        <div className="mb-6 flex flex-wrap items-end justify-end gap-2 md:items-start">
          <div className="flex-1">
            <div className="flex content-center text-base text-foreground-1">
              Volume trend
              <Tooltip
                classNames={tooltip}
                content={
                  <>
                    Due to the expanding pool of Liquid Staking Tokens (LST) and
                    Liquid Restaking Tokens (LRT), the TVL value on this
                    dashboard may not always match the actual TVL of the entire
                    token pool. Refer to the dashboard token list for the
                    current LST and LRT data included in the TVL calculation.
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
            <div className="text-foreground-2">{getLatestTotal}</div>
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
        <div className="relative">
          <svg
            className="w-full touch-pan-y"
            height={height}
            ref={containerRef}
            width={width}
          >
            <Group left={margin.left} top={margin.top}>
              <GridRows
                className="opacity-25 [&_line]:stroke-outline"
                height={state.maxY - margin.bottom - brushSize.marginTop}
                numTicks={4}
                scale={scaleValue}
                width={state.maxX - margin.right}
                x="0"
                y="0"
              />
              <AreaStack
                curve={curveMonotoneX}
                data={state.filteredPoints}
                defined={isDefined}
                keys={state.keys}
                value={getValue}
                x={d => scaleDate(getDate(d.data)) ?? 0}
                y0={d => scaleValue(getY0(d)) ?? 0}
                y1={d => scaleValue(getY1(d)) ?? 0}
              >
                {({ stacks, path }) =>
                  stacks.map((stack, i) => {
                    const color = `hsl(var(--app-chart-${i + 1}))`;

                    return (
                      <path
                        d={path(stack) || ''}
                        fill={color}
                        key={`stack-${stack.key}`}
                        onPointerEnter={e => handleAreaPointerMove(e, stack)}
                        onPointerLeave={hideTooltip}
                        onPointerMove={e => handleAreaPointerMove(e, stack)}
                        stroke={color}
                      />
                    );
                  })
                }
              </AreaStack>
              {tooltipOpen && (
                <line
                  opacity="0.8"
                  pointerEvents="none"
                  stroke="hsl(var(--app-foreground))"
                  strokeDasharray="2,2"
                  strokeWidth="1"
                  x1={tooltipLeft - margin.left}
                  x2={tooltipLeft - margin.left}
                  y1="0"
                  y2={state.maxY - margin.bottom - brushSize.marginTop}
                />
              )}
              <AxisRight
                axisLineClassName="stroke-foreground-2"
                hideZero={true}
                left={state.maxX - margin.right}
                numTicks={4}
                scale={scaleValue}
                tickClassName="[&_line]:stroke-foreground-2"
                tickFormat={value => formatNumber(value, true)}
                tickLabelProps={{
                  className: 'text-xs',
                  fill: 'hsl(var(--app-foreground-1))',
                  fontFamily: undefined,
                  fontSize: undefined
                }}
              />
              <AxisBottom
                axisLineClassName="stroke-foreground-2"
                numTicks={
                  state.filteredPoints.length > 10
                    ? Math.round(state.maxX / 120)
                    : state.filteredPoints.length
                }
                scale={scaleDate}
                tickClassName="[&_line]:stroke-foreground-2"
                tickFormat={formatDate}
                tickLabelProps={{
                  className: 'text-xs',
                  fill: 'hsl(var(--app-foreground-1))',
                  fontFamily: undefined,
                  fontSize: undefined
                }}
                top={state.maxY - brushSize.marginTop - margin.bottom}
              />
            </Group>
            <Group
              left={margin.left}
              top={height - brushSize.height + 1} // 1 for brush top border
            >
              <AreaClosed
                className="fill-outline"
                curve={curveMonotoneX}
                data={state.brushData}
                key="value"
                x={d => scaleBrushDate(getDate(d)) ?? 0}
                y={d =>
                  scaleBrushValue(d.value * (state.useRate ? d.rate : 1)) ?? 0
                }
                yScale={scaleBrushValue}
              />
            </Group>
          </svg>
          <div
            className="absolute bottom-px border border-outline"
            style={{
              height: brushSize.height,
              width: state.maxX - margin.right
            }}
          >
            <HBrush
              brushClassName="bg-foreground-2/35 h-full"
              brushPosition={state.brushPosition}
              onChange={handleBrushChange}
              scale={scaleBrushDate}
              trackClassName="absolute h-full w-full"
            />
          </div>
        </div>
      </div>
      {tooltipOpen && (
        <TooltipInPortal
          applyPositionStyle={true}
          className="rd-tooltip"
          key={Math.random()}
          left={tooltipLeft}
          top={tooltipTop}
          unstyled={true}
        >
          <div className="rd-tooltip-title px-2">
            {tooltipDateFormatter.format(new Date(tooltipData.x))}
          </div>
          <ul>
            {state.keys.map((key, i) => {
              return (
                <li key={`tt-${key}`}>
                  <div
                    className={`${key === tooltipData.key ? 'dark:bg-white/25' : ''} flex flex-row items-center gap-1 px-2 py-1`}
                  >
                    <span
                      className={`inline-block h-3 w-3 rounded-full`}
                      style={{
                        backgroundColor: `hsl(var(--app-chart-${i + 1}))`
                      }}
                    ></span>
                    {allStrategyAssetMapping[key]?.symbol ?? key}
                    <span className="grow ps-4 text-end">
                      {state.useRate
                        ? formatUSD(getValue(tooltipData.data, key))
                        : formatETH(getValue(tooltipData.data, key))}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-2 flex flex-row px-2">
            <span>Total</span>
            <span className="grow text-end">
              {calculateTotal(tooltipData.data, state.useRate)}
            </span>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}

// eslint-disable-next-line no-undef
const axisDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short'
});
const bisectDate = bisector(stack => stack.data.timestamp).left;
const brushSize = { height: 50, marginTop: 20 };
const calculateTotal = (data, useRate) => {
  const total = data.strategies.reduce((acc, s) => acc + s.value, 0);

  return useRate ? formatUSD(total * data.rate) : formatETH(total);
};
const formatDate = date => {
  if (date.getMonth() == 0 && date.getDate() == 1) {
    return date.getFullYear();
  }

  return axisDateFormatter.format(date);
};
const getDate = d => new Date(d.timestamp);
const getY0 = d => d[0];
const getY1 = d => d[1];
const isDefined = d => !!d[1];
const margin = { top: 8, right: 40, bottom: 35, left: 1 };
const TIMELINE_DEFAULT = 'all';
const timelines = {
  '1w': 7,
  '1m': 30,
  '3m': 90,
  '1y': 365,
  all: Number.MAX_SAFE_INTEGER
};
// eslint-disable-next-line no-undef
const tooltipDateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
});
