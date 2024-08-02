import { AreaClosed, AreaStack } from '@visx/shape';
import { AxisBottom, AxisRight } from '@visx/axis';
import { formatETH, formatNumber, formatUSD } from '../../shared/formatters';
import { scaleLinear, scaleUtc } from '@visx/scale';
import { Tab, Tabs } from '@nextui-org/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { bisector } from '@visx/vendor/d3-array';
import { curveMonotoneX } from '@visx/curve';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import HBrush from '../../shared/HBrush';
import { localPoint } from '@visx/event';
import { reduceState } from '../../shared/helpers';
import { tabs } from '../../shared/slots';
import { useMutativeReducer } from 'use-mutative';

export default function EigenLayerTVLOvertimeChart({ eigenLayerTVL, height }) {
  const [state, dispatch] = useMutativeReducer(reduceState, {
    filteredData: [],
    keys: ['ethTVL', 'lstTVL'],
    maxX: 0,
    maxY: 0,
    useRate: false
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
              let value = 0;

              value += parseFloat(BigInt(d.ethTVL) / BigInt(1e18));
              value += parseFloat(BigInt(d.lstTVL) / BigInt(1e18));

              return value;
            })
          )
        ],
        nice: true,
        range: [brushSize.height - 2, 0] // 2 for brush borders
      }),
    [eigenLayerTVL]
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
              let value = 0;

              value += parseFloat(BigInt(d.ethTVL) / BigInt(1e18));
              value += parseFloat(BigInt(d.lstTVL) / BigInt(1e18));

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
    let total = 0;

    total += parseFloat(BigInt(last.ethTVL) / BigInt(1e18));
    total += parseFloat(BigInt(last.lstTVL) / BigInt(1e18));

    return state.useRate ? formatUSD(total * last.rate) : formatETH(total);
  }, [eigenLayerTVL, state.useRate]);

  const getValue = useCallback(
    (d, k) =>
      parseFloat(BigInt(d[k]) / BigInt(1e18)) * (state.useRate ? d.rate : 1),
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

  const handleTabSelectionChange = useCallback(
    key => {
      const start = Math.max(0, eigenLayerTVL.length - 1 - tabMap[key]);

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
        let value = 0;
        value += parseFloat(BigInt(d.ethTVL) / BigInt(1e18));
        value += parseFloat(BigInt(d.lstTVL) / BigInt(1e18));

        return { timestamp: d.timestamp, value };
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
          <div className="text-base text-foreground-1">TVL over time</div>
          <div className="text-sm text-foreground-2">{getLatestTotal}</div>
        </div>
        <Tabs
          classNames={tabs}
          defaultSelectedKey="eth"
          disabledKeys={['usd']}
          onSelectionChange={handleRateSelectionChange}
          size="sm"
        >
          <Tab key="usd" title="USD" />
          <Tab key="eth" title="ETH" />
        </Tabs>
        <Tabs
          classNames={tabs}
          defaultSelectedKey="3m"
          onSelectionChange={handleTabSelectionChange}
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
                fill: 'hsl(var(--app-foreground))',
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
                fill: 'hsl(var(--app-foreground))',
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
      {tooltipOpen && (
        <TooltipInPortal
          applyPositionStyle={true}
          className="min-w-40 rounded bg-white/75 py-2 text-foreground shadow-md backdrop-blur dark:bg-outline/75"
          key={Math.random()}
          left={tooltipLeft}
          top={tooltipTop}
          unstyled={true}
        >
          <div className="mb-2 px-2 text-xs font-bold">
            {tooltipDateFormatter.format(new Date(tooltipData.x))}
          </div>
          <ul className="text-sm">
            <li>
              <div
                className={`${'ethTVL' === tooltipData.key ? 'dark:bg-white/25' : ''} flex flex-row items-center gap-1 px-2 py-1`}
              >
                <span
                  className={`inline-block h-3 w-3 rounded-full`}
                  style={{
                    backgroundColor: `hsl(var(--app-chart-1))`
                  }}
                ></span>
                ETH
                <span className="grow ps-4 text-end">
                  {state.useRate
                    ? formatUSD(
                        parseFloat(
                          BigInt(tooltipData.data.ethTVL) / BigInt(1e18)
                        ) * tooltipData.data.rate
                      )
                    : formatETH(
                        parseFloat(
                          BigInt(tooltipData.data.ethTVL) / BigInt(1e18)
                        )
                      )}
                </span>
              </div>
            </li>
            <li>
              <div
                className={`${'lstTVL' === tooltipData.key ? 'dark:bg-white/25' : ''} flex flex-row items-center gap-1 px-2 py-1`}
              >
                <span
                  className={`inline-block h-3 w-3 rounded-full`}
                  style={{
                    backgroundColor: `hsl(var(--app-chart-2))`
                  }}
                ></span>
                LST
                <span className="grow ps-4 text-end">
                  {state.useRate
                    ? formatUSD(
                        parseFloat(
                          BigInt(tooltipData.data.lstTVL) / BigInt(1e18)
                        ) * tooltipData.data.rate
                      )
                    : formatETH(
                        parseFloat(
                          BigInt(tooltipData.data.lstTVL) / BigInt(1e18)
                        )
                      )}
                </span>
              </div>
            </li>
          </ul>
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
const getDate = d => new Date(d.timestamp);
const getY0 = d => d[0];
const getY1 = d => d[1];
const isDefined = d => !!d[1];
const margin = { top: 8, right: 48, bottom: 1, left: 1 };

const tabMap = {
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
