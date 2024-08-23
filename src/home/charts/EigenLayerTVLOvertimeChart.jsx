import { AreaClosed, AreaStack } from '@visx/shape';
import { AxisBottom, AxisRight } from '@visx/axis';
import { formatETH, formatNumber, formatUSD } from '../../shared/formatters';
import { scaleLinear, scaleUtc } from '@visx/scale';
import { Tab, Tabs, Tooltip } from '@nextui-org/react';
import { tabs, tooltip } from '../../shared/slots';
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

export default function EigenLayerTVLOvertimeChart({ eigenLayerTVL, height }) {
  const [state, dispatch] = useMutativeReducer(reduceState, {
    filteredData: [],
    keys: ['ethTVL', 'lstTVL'],
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
          Math.min(...eigenLayerTVL.map(getDate)),
          Math.max(...eigenLayerTVL.map(getDate))
        ],
        range: [0, state.maxX - 2] // 2 for brush borders
      }),
    [eigenLayerTVL, state.maxX]
  );

  const scaleBrushValue = useMemo(
    () =>
      scaleLinear({
        domain: [
          0,
          Math.max(
            ...eigenLayerTVL.map(d => {
              const value = d.ethTVL + d.lstTVL;

              return value * (state.useRate ? d.rate : 1);
            })
          )
        ],
        nice: true,
        range: [brushSize.height - 2, 0] // 2 for brush borders
      }),
    [eigenLayerTVL, state.useRate]
  );

  const scaleDate = useMemo(
    () =>
      scaleUtc({
        domain: [
          Math.min(...state.filteredData.map(getDate)),
          Math.max(...state.filteredData.map(getDate))
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
          Math.max(
            ...state.filteredData.map(d => {
              const value = d.ethTVL + d.lstTVL;

              return value * (state.useRate ? d.rate : 1);
            })
          ) * 1.1 // 10% padding
        ],
        nice: true,
        range: [state.maxY, 0]
      }),
    [state.useRate, state.filteredData, state.maxY]
  );

  const getLatestTotal = useMemo(() => {
    const last = eigenLayerTVL[eigenLayerTVL.length - 1];
    const total = Number(last.ethTVL + last.lstTVL);

    return state.useRate ? formatUSD(total * last.rate) : formatETH(total);
  }, [eigenLayerTVL, state.useRate]);

  const getValue = useCallback(
    (d, k) => Number(d[k]) * (state.useRate ? d.rate : 1),
    [state.useRate]
  );

  const handleBrushChange = useCallback(
    domain => {
      const { x0, x1 } = domain;
      const filtered = eigenLayerTVL.filter(
        s => s.timestamp >= x0 && s.timestamp <= x1
      );

      dispatch({ brushPosition: null, filteredData: filtered });
    },
    [eigenLayerTVL, dispatch]
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

  const handleTimelineSelectionChange = useCallback(
    key => {
      const start = Math.max(0, eigenLayerTVL.length - 1 - timelines[key]);

      dispatch({
        brushPosition: {
          start: scaleBrushDate(eigenLayerTVL[start].timestamp),
          end: scaleBrushDate(eigenLayerTVL[eigenLayerTVL.length - 1].timestamp)
        },
        filteredData: eigenLayerTVL.slice(start)
      });
    },
    [eigenLayerTVL, dispatch, scaleBrushDate]
  );

  const handleRateSelectionChange = useCallback(
    key => dispatch({ useRate: key === 'usd' }),
    [dispatch]
  );

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

    if (rootRef.current) {
      ro.observe(rootRef.current);
    }

    if (dateAxisRef.current) {
      ro.observe(dateAxisRef.current);
    }

    return () => ro.disconnect();
  }, [dispatch, height]);

  useEffect(() => {
    dispatch({
      brushData: eigenLayerTVL?.map(d => {
        const value = Number(d.ethTVL + d.lstTVL);

        return { timestamp: d.timestamp, value, rate: d.rate };
      }),
      brushPosition: {
        start: scaleBrushDate(
          eigenLayerTVL[eigenLayerTVL.length - 1 - 90].timestamp
        ),
        end: scaleBrushDate(eigenLayerTVL[eigenLayerTVL.length - 1].timestamp)
      },
      filteredData: eigenLayerTVL.slice(-90)
    });
  }, [eigenLayerTVL, dispatch, scaleBrushDate]);

  return (
    <div className="rd-box min-h-44 basis-full p-4" ref={rootRef}>
      <div className="mb-6 flex flex-wrap items-start justify-end gap-2 md:items-center">
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
          defaultSelectedKey="3m"
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
              tickFormat={v => formatNumber(v, true)}
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
            top={height - margin.bottom - brushSize.height + 1} // 1 for brush top border
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
              ETH
            </div>
          </li>
          <li className="me-4 inline-block">
            <div className="flex flex-row items-center gap-1 text-sm">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: 'hsl(var(--app-chart-2))' }}
              ></span>
              LST
            </div>
          </li>
        </ul>
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
          <ul className="text-sm">
            <li>
              <div
                className={`${'ethTVL' === tooltipData.key ? 'dark:bg-white/25' : ''} flex flex-row items-center gap-1 px-2 py-1`}
              >
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: 'hsl(var(--app-chart-1))'
                  }}
                ></span>
                ETH
                <span className="grow ps-4 text-end">
                  {formatTooltipValue(
                    tooltipData.data.ethTVL,
                    tooltipData.data.rate,
                    state.useRate
                  )}
                </span>
              </div>
            </li>
            <li>
              <div
                className={`${'lstTVL' === tooltipData.key ? 'dark:bg-white/25' : ''} flex flex-row items-center gap-1 px-2 py-1`}
              >
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: 'hsl(var(--app-chart-2))'
                  }}
                ></span>
                LST
                <span className="grow ps-4 text-end">
                  {formatTooltipValue(
                    tooltipData.data.lstTVL,
                    tooltipData.data.rate,
                    state.useRate
                  )}
                </span>
              </div>
            </li>
          </ul>
          <div className="mt-2 flex flex-row px-2">
            <span>Total</span>
            <span className="grow text-end">
              {formatTooltipValue(
                tooltipData.data.ethTVL + tooltipData.data.lstTVL,
                tooltipData.data.rate,
                state.useRate
              )}
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
const bisectDate = bisector(i => i.data.timestamp).left;
const brushSize = { height: 50, marginTop: 20 };
const formatDate = date => {
  if (date.getMonth() == 0 && date.getDate() == 1) {
    return date.getFullYear();
  }

  return axisDateFormatter.format(date);
};
const formatTooltipValue = (value, rate, useRate) =>
  useRate ? formatUSD(value * rate) : formatETH(value);

const getDate = d => new Date(d.timestamp);
const getY0 = d => d[0];
const getY1 = d => d[1];
const isDefined = d => !!d[1];
const margin = { top: 8, right: 48, bottom: 1, left: 1 };
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
