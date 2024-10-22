import { AreaClosed, AreaStack } from '@visx/shape';
import { AxisBottom, AxisRight } from '@visx/axis';
import { scaleLinear, scaleUtc } from '@visx/scale';
import { Tab, Tabs } from '@nextui-org/react';
import { tabs } from '../../shared/slots';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { bisector } from '@visx/vendor/d3-array';
import { curveMonotoneX } from '@visx/curve';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import HBrush from '../../shared/HBrush';
import { localPoint } from '@visx/event';
import { reduceState } from '../../shared/helpers';
import { useMutativeReducer } from 'use-mutative';

export default function RewardsEarnedLineChart({ rewardsData, height, ethRate }) {

  const processedData = useMemo(() => {
    return [...rewardsData]
      .reverse()
      .map(item => ({
        ...item,
        tokens: item.tokens.map(token => ({
          ...token,
          amountETH: parseFloat(token.amountETH),
          amount: parseFloat(token.amount)
        })),
        rewardsTotal: parseFloat(item.rewardsTotal)
      }));
  }, [rewardsData]);

  const [state, dispatch] = useMutativeReducer(reduceState, {
    filteredData: processedData,
    keys: ['WETH', 'ARPA', 'Eigenlayer'],
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

  const dateAxisRef = useRef(null);
  const rootRef = useRef(null);

  const scaleBrushDate = useMemo(
    () =>
      scaleUtc({
        domain: [
          Math.min(...rewardsData.map(d => new Date(d.timestamp))),
          Math.max(...rewardsData.map(d => new Date(d.timestamp)))
        ],
        range: [0, state.maxX - 2]
      }),
    [rewardsData, state.maxX]
  );

  const scaleBrushValue = useMemo(
    () =>
      scaleLinear({
        domain: [
          0,
          Math.max(...rewardsData.map(d => Number(d.rewardsTotal)))
        ],
        nice: true,
        range: [brushSize.height - 2, 0]
      }),
    [rewardsData]
  );

  const scaleDate = useMemo(
    () =>
      scaleUtc({
        domain: [
          Math.min(...state.filteredData.map(d => new Date(d.timestamp))),
          Math.max(...state.filteredData.map(d => new Date(d.timestamp)))
        ],
        range: [0, state.maxX]
      }),
    [state.filteredData, state.maxX]
  );

  const scaleValue = useMemo(
    () =>
      scaleLinear({
        domain: [
          0,
          Math.max(...state.filteredData.map(d => Number(d.rewardsTotal))) * 1.1
        ],
        nice: true,
        range: [state.maxY, 0]
      }),
    [state.filteredData, state.maxY]
  );

  const getLatestTotal = useMemo(() => {
    const last = rewardsData[0]; // Data is in reverse chronological order
    return formatETH(Number(last.rewardsTotal), state.useRate, ethRate);
  }, [rewardsData, state.useRate, ethRate]);

  const getValue = useCallback((d, tokenSymbol) => {
    const token = d.tokens.find(t => t.symbol === tokenSymbol);
    return token ? parseFloat(token.amountETH) : 0;
  }, []);


  const handleBrushChange = useCallback(
    domain => {
      hideTooltip();

      const { x0, x1 } = domain;
      const filtered = rewardsData.filter(
        s => {
          const date = new Date(s.timestamp);
          return date >= x0 && date <= x1;
        }
      );

      // Ensure we have properly formatted data
      const processedFiltered = filtered.map(item => ({
        ...item,
        tokens: item.tokens.map(token => ({
          ...token,
          amountETH: parseFloat(token.amountETH),
          amount: parseFloat(token.amount)
        })),
        rewardsTotal: parseFloat(item.rewardsTotal)
      }));

      dispatch({
        brushPosition: null,
        filteredData: processedFiltered,
        // Update scales immediately
        maxX: state.maxX,
        maxY: state.maxY
      });
    },
    [rewardsData, dispatch, hideTooltip, state.maxX, state.maxY]
  );

  const handleAreaPointerMove = useCallback(
    (event, stack) => {
      if (!stack || !stack.length) return;

      const point = localPoint(event.target.ownerSVGElement, event);
      if (!point) return;

      const x = scaleDate.invert(point.x - margin.left).getTime();

      // Find the index of the nearest data point
      let index = bisectDate(stack, x, 1);

      // Adjust index bounds
      if (index >= stack.length) {
        index = stack.length - 1;
      }
      if (index < 1) {
        index = 1;
      }

      // Safety check for data availability
      if (!stack[index - 1]?.data || !stack[index]?.data) return;

      const x0 = new Date(stack[index - 1].data.timestamp).getTime();
      const x1 = new Date(stack[index].data.timestamp).getTime();

      // Find the closest point
      const i = x - x0 > x1 - x ? index : index - 1;

      // Ensure we have valid data
      if (stack[i] && stack[i].data) {
        showTooltip({
          tooltipData: {
            key: stack.key,
            data: stack[i].data,
            x,
          },
          tooltipLeft: point.x,
          tooltipTop: point.y
        });
      }
    },
    [showTooltip, scaleDate]
  );

  const handleTimelineSelectionChange = useCallback(
    key => {
      hideTooltip(); // Hide tooltip when changing timeline

      if (key === 'all') {
        dispatch({
          brushPosition: {
            start: scaleBrushDate(new Date(processedData[0].timestamp)),
            end: scaleBrushDate(new Date(processedData[processedData.length - 1].timestamp))
          },
          filteredData: processedData
        });
      } else {
        const daysToShow = timelines[key];
        const filteredData = processedData.slice(-daysToShow);

        dispatch({
          brushPosition: {
            start: scaleBrushDate(new Date(filteredData[0].timestamp)),
            end: scaleBrushDate(new Date(filteredData[filteredData.length - 1].timestamp))
          },
          filteredData
        });
      }
    },
    [rewardsData, processedData, dispatch, scaleBrushDate, hideTooltip]
  );

  const handleRateSelectionChange = useCallback(
    key => dispatch({
      useRate: key === 'usd',
    }),
    [dispatch]
  );

  const formatAxisValue = (value) => {
    if (state.useRate) {
      return formatUSD(value * ethRate);
    }
    return formatETH(value);
  };

  const formatTooltipValue = (value) => {
    return formatETH(value, state.useRate, ethRate);
  };

  useEffect(() => {
    if (state.filteredData.length) {
      const dateScale = scaleUtc({
        domain: [
          Math.min(...state.filteredData.map(d => new Date(d.timestamp))),
          Math.max(...state.filteredData.map(d => new Date(d.timestamp)))
        ],
        range: [0, state.maxX]
      });

      const valueScale = scaleLinear({
        domain: [
          0,
          Math.max(...state.filteredData.map(d => Number(d.rewardsTotal))) * 1.1
        ],
        nice: true,
        range: [state.maxY, 0]
      });

      dispatch({
        scaleDate: dateScale,
        scaleValue: valueScale
      });
    }
  }, [state.filteredData, state.maxX, state.maxY]);


  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target === rootRef.current) {
          dispatch({
            maxX: entry.contentRect.width - margin.left - margin.right
          });
        } else if (entry.target === dateAxisRef.current) {
          dispatch({
            maxY:
              height -
              margin.top -
              margin.bottom -
              Math.ceil(entry.contentRect.height) -
              brushSize.height -
              brushSize.marginTop
          });
        }
      }
    });

    if (rootRef.current) ro.observe(rootRef.current);
    if (dateAxisRef.current) ro.observe(dateAxisRef.current);

    return () => ro.disconnect();
  }, [dispatch, height]);


  useEffect(() => {
    if (rewardsData.length && !state.filteredData.length) {
      handleTimelineSelectionChange('all');
    }
  }, [rewardsData, handleTimelineSelectionChange]);

  useEffect(() => {
    dispatch({
      brushData: processedData.map(d => ({
        timestamp: d.timestamp,
        value: Number(d.rewardsTotal)
      }))
    });
  }, [processedData, dispatch]);


  useEffect(() => {
    if (state.maxX && !state.filteredData.length) {
      handleTimelineSelectionChange(TIMELINE_DEFAULT);
    }
  }, [handleTimelineSelectionChange, state.filteredData, state.maxX]);

  return (
    <div className="rd-box min-h-44 basis-full p-4" ref={rootRef}>
      <div className="mb-6 flex flex-wrap items-start justify-end gap-2 md:items-center">
        <div className="flex-1">
          <div className="flex content-center text-base text-foreground-1">
            Rewards over time
          </div>
          <div className="text-sm text-foreground-2">{getLatestTotal}</div>
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
          defaultSelectedKey="all"
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
        <svg className="w-full touch-pan-y" height={height} ref={containerRef}>
          <Group left={margin.left} top={margin.top}>
            <GridRows
              className="opacity-25 [&_line]:stroke-outline"
              height={state.maxY}
              numTicks={4}
              scale={scaleValue}
              width={state.maxX}
              x="0"
              y="0"
            />
            <AreaStack
              curve={curveMonotoneX}
              data={state.filteredData}
              defined={isDefined}
              keys={state.keys}
              value={getValue}
              x={d => scaleDate(new Date(d.data.timestamp)) ?? 0}
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
                y2={state.maxY}
              />
            )}
            <AxisRight
              axisLineClassName="stroke-foreground-2"
              hideZero={true}
              left={state.maxX}
              numTicks={4}
              scale={scaleValue}
              tickClassName="[&_line]:stroke-foreground-2"
              tickFormat={formatAxisValue}
              tickLabelProps={{
                className: 'text-xs',
                fill: 'hsl(var(--app-foreground-1))',
                fontFamily: null,
                fontSize: null
              }}
            />
            <AxisBottom
              axisLineClassName="stroke-foreground-2"
              innerRef={dateAxisRef}
              numTicks={Math.round(state.maxX / 120)}
              scale={scaleDate}
              tickClassName="[&_line]:stroke-foreground-2"
              tickFormat={formatDate}
              tickLabelProps={{
                className: 'text-xs',
                fill: 'hsl(var(--app-foreground-1))',
                fontFamily: null,
                fontSize: null
              }}
              top={state.maxY}
            />
          </Group>
          <Group
            left={margin.left}
            top={height - margin.bottom - brushSize.height + 1}
          >
            <AreaClosed
              className="fill-outline"
              curve={curveMonotoneX}
              data={state.brushData}
              x={d => scaleBrushDate(new Date(d.timestamp)) ?? 0}
              y={d => scaleBrushValue(d.value) ?? 0}
              yScale={scaleBrushValue}
            />
          </Group>
        </svg>
        <div
          className="absolute bottom-px border border-outline"
          style={{
            height: brushSize.height,
            width: state.maxX ?? 0
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
      <div className="mt-4">
        <ul className="w-full text-foreground-1">
          <li className="me-4 inline-block">
            <div className="flex flex-row items-center gap-1 text-sm">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: 'hsl(var(--app-chart-1))' }}
              ></span>
              WETH
            </div>
          </li>
          <li className="me-4 inline-block">
            <div className="flex flex-row items-center gap-1 text-sm">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: 'hsl(var(--app-chart-2))' }}
              ></span>
              ARPA
            </div>
          </li>

          <li className="me-4 inline-block">
            <div className="flex flex-row items-center gap-1 text-sm">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: 'hsl(var(--app-chart-3))' }}
              ></span>
              Eigen Layer
            </div>
          </li>
        </ul>
      </div>
      {tooltipOpen && tooltipData && tooltipData.data && (
        <TooltipInPortal
          applyPositionStyle={true}
          className="rd-tooltip"
          key={Math.random()}
          left={tooltipLeft}
          top={tooltipTop}
          unstyled={true}
        >
          <div className="rd-tooltip-title px-2">
            {tooltipDateFormatter.format(new Date(tooltipData.data.timestamp))}
          </div>
          <ul className="text-sm">
            <li>
              <div
                className={`${'WETH' === tooltipData.key ? 'dark:bg-white/25' : ''} flex flex-row items-center gap-1 px-2 py-1`}
              >
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: 'hsl(var(--app-chart-1))'
                  }}
                ></span>
                WETH
                <span className="grow ps-4 text-end">
                  {formatTooltipValue(tooltipData.data.tokens.find(t => t.symbol === 'WETH')?.amountETH || 0)}
                </span>
              </div>
            </li>
            <li>
              <div
                className={`${'ARPA' === tooltipData.key ? 'dark:bg-white/25' : ''} flex flex-row items-center gap-1 px-2 py-1`}
              >
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: 'hsl(var(--app-chart-2))'
                  }}
                ></span>
                ARPA
                <span className="grow ps-4 text-end">
                  {formatTooltipValue(tooltipData.data.tokens.find(t => t.symbol === 'ARPA')?.amountETH || 0)}
                </span>
              </div>
            </li>
            <li>
              <div
                className={`${'Eigenlayer' === tooltipData.key ? 'dark:bg-white/25' : ''} flex flex-row items-center gap-1 px-2 py-1`}
              >
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: 'hsl(var(--app-chart-3))'
                  }}
                ></span>
                Eigenlayer
                <span className="grow ps-4 text-end">
                  {formatTooltipValue(tooltipData.data.tokens.find(t => t.symbol === '0xec53bf9167f50cdeb3ae105f56099aaab9061f83')?.amountETH || 0)}
                </span>
              </div>
            </li>
          </ul>
          <div className="mt-2 flex flex-row px-2">
            <span>Total</span>
            <span className="grow text-end">
              {formatTooltipValue(tooltipData.data.rewardsTotal)}
            </span>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}

const axisDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short'
});
const bisectDate = bisector(d => new Date(d.data.timestamp)).left;
const brushSize = { height: 50, marginTop: 20 };
const formatDate = date => {
  if (date.getMonth() === 0 && date.getDate() === 1) {
    return date.getFullYear();
  }
  return axisDateFormatter.format(date);
};
const getY0 = d => d[0];
const getY1 = d => d[1];
const isDefined = d => !isNaN(d[1]);
const margin = {
  top: 8,
  right: 95,
  bottom: 1,
  left: 1
};

const TIMELINE_DEFAULT = 'all';

const timelines = {
  '1w': 7,
  '1m': 30,
  '3m': 90,
  '1y': 365,
  all: Number.MAX_SAFE_INTEGER
};

const tooltipDateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
});

const formatUSD = (value) => {
  if (typeof value !== 'number') return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const formatETH = (value, useRate = false, ethRate = 0) => {
  if (typeof value !== 'number') return useRate ? '$0.00' : '0 ETH';
  if (useRate) {
    return formatUSD(value * ethRate);
  }
  return `${value.toFixed(6)} ETH`;
};

