import { AreaClosed, AreaStack } from '@visx/shape';
import { AxisBottom, AxisRight } from '@visx/axis';
import { scaleLinear, scaleUtc } from '@visx/scale';
import { Tab, Tabs } from '@nextui-org/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { bisector } from '@visx/vendor/d3-array';
import { curveMonotoneX } from '@visx/curve';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import HBrush from '../shared/HBrush';
import { localPoint } from '@visx/event';
import { reduceState } from '../shared/helpers';
import { tabs } from '../shared/slots';
import { useMutativeReducer } from 'use-mutative';

export default function LRTDistribution({ data, height }) {
  const [state, dispatch] = useMutativeReducer(reduceState, {
    filteredData: [],
    keys: [],
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
          Math.min(...data.map(getDate)),
          Math.max(...data.map(getDate))
        ],
        range: [0, state.maxX - 2] // 2 for brush borders
      }),
    [data, state.maxX]
  );
  const scaleBrushValue = useMemo(
    () =>
      scaleLinear({
        domain: [
          0,
          Math.max(
            ...data.map(d => {
              let value = 0;

              for (let k in d.protocols) {
                value += d.protocols[k];
              }

              return value;
            })
          )
        ],
        nice: true,
        range: [brushSize.height - 2, 0] // 2 for brush borders
      }),
    [data]
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

              for (let k in d.protocols) {
                value += d.protocols[k];
              }

              return value * (state.useRate ? d.rate : 1);
            })
          ) * 1.1 // 10% padding
        ],
        nice: true,
        range: [state.maxY, 0]
      }),
    [state.useRate, state.filteredData, state.maxY]
  );
  const getValue = useCallback(
    (d, k) => d.protocols[k] * (state.useRate ? d.rate : 1),
    [state.useRate]
  );
  const handleBrushChange = useCallback(
    domain => {
      const { x0, x1 } = domain;
      const filtered = data.filter(s => s.timestamp >= x0 && s.timestamp <= x1);

      dispatch({ brushPosition: null, filteredData: filtered });
    },
    [data, dispatch]
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
      const start = Math.max(0, data.length - 1 - tabMap[key]);

      dispatch({
        brushPosition: {
          start: scaleBrushDate(data[start].timestamp),
          end: scaleBrushDate(data[data.length - 1].timestamp)
        },
        filteredData: data.slice(start)
      });
    },
    [data, dispatch, scaleBrushDate]
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
      brushData: data?.map(d => {
        let value = 0;

        for (let k in d.protocols) {
          value += d.protocols[k];
        }

        return { timestamp: d.timestamp, value };
      }),
      brushPosition: {
        start: scaleBrushDate(data[data.length - 1 - 90].timestamp),
        end: scaleBrushDate(data[data.length - 1].timestamp)
      },
      filteredData: data.slice(-90),
      keys: Object.keys(data?.[data.length - 1].protocols).sort(sortProtocols)
    });
  }, [data, dispatch, scaleBrushDate]);

  return (
    <div ref={rootRef}>
      <div className="flex mb-6 justify-between">
        <div className="flex text-foreground-2 gap-2 items-center text-lg">
          <span className="hidden md:inline">Volume over time in</span>
          <Tabs
            classNames={tabs}
            defaultSelectedKey="usd"
            onSelectionChange={handleRateSelectionChange}
            size="sm"
          >
            <Tab key="usd" title="USD" />
            <Tab key="eth" title="ETH" />
          </Tabs>
        </div>
        <Tabs
          classNames={tabs}
          defaultSelectedKey="3m"
          disabledKeys={['1y']}
          onSelectionChange={handleTabSelectionChange}
          size="sm"
          //variant="bordered"
        >
          <Tab key="1w" title="1W" />
          <Tab key="1m" title="1M" />
          <Tab key="3m" title="3M" />
          <Tab key="1y" title="1Y" />
          <Tab key="all" title="All" />
        </Tabs>
      </div>
      <div className="relative">
        <svg ref={containerRef} height={height} className="touch-pan-y w-full">
          <Group top={margin.top} left={margin.left}>
            <GridRows
              className="[&_line]:stroke-outline opacity-25"
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
                stacks.map(stack => (
                  <path
                    key={`stack-${stack.key}`}
                    d={path(stack) || ''}
                    fill={protocols[stack.key].color}
                    onPointerEnter={e => handleAreaPointerMove(e, stack)}
                    onPointerLeave={hideTooltip}
                    onPointerMove={e => handleAreaPointerMove(e, stack)}
                    stroke={protocols[stack.key].color}
                    // opacity={0.75}
                  />
                ))
              }
            </AreaStack>
            {tooltipOpen && (
              <line
                opacity="0.8"
                pointerEvents="none"
                stroke="hsl(var(--app-primary-600))"
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
              tickFormat={formatValue}
              tickClassName="[&_line]:stroke-foreground-2"
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
              // rangePadding={margin.right}
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
          className="absolute border border-outline bottom-px"
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
      <ul className="mt-4 pe-8 w-full">
        {state.keys
          ?.slice()
          .sort()
          .map(key => (
            <li key={key} className="inline-block me-4">
              <div className="flex flex-row gap-1 items-center text-sm">
                <span
                  className="inline-block h-3 rounded-full w-3"
                  style={{ backgroundColor: protocols[key].color }}
                ></span>
                {protocols[key]?.name ?? key}
              </div>
            </li>
          ))}
      </ul>
      {tooltipOpen && (
        <TooltipInPortal
          key={Math.random()}
          applyPositionStyle={true}
          className="backdrop-blur bg-white/75 dark:bg-background/75 py-2 rounded min-w-40 shadow-md text-foreground"
          left={tooltipLeft}
          top={tooltipTop}
          unstyled={true}
        >
          <div className="font-bold text-xs mb-2 px-2">
            {tooltipDateFormatter.format(new Date(tooltipData.x))}
          </div>
          <ul className="text-sm">
            {Object.keys(tooltipData.data.protocols)
              .sort()
              .map(key => (
                <li key={`tt-${key}`}>
                  <div
                    className={`${key === tooltipData.key ? 'dark:bg-white/25' : ''} flex flex-row gap-1 items-center px-2 py-1`}
                  >
                    <span
                      className="h-3 inline-block rounded-full w-3"
                      style={{ backgroundColor: protocols[key].color }}
                    ></span>
                    {protocols[key]?.name ?? key}
                    <span className="grow ps-4 text-end">
                      {tooltipCurFormatter.format(
                        Number(
                          tooltipData.data.protocols[key] *
                            (state.useRate ? tooltipData.data.rate : 1)
                        )
                      )}
                    </span>
                  </div>
                </li>
              ))}
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
const formatValue = value => {
  if (value >= 1e9) {
    return `${value / 1e9}b`;
  }

  if (value >= 1e6) {
    return `${value / 1e6}m`;
  }

  return `${value / 1_000}k`;
};
const getDate = d => new Date(d.timestamp);

const getY0 = d => d[0];
const getY1 = d => d[1];
const isDefined = d => !!d[1];
const margin = { top: 8, right: 48, bottom: 1, left: 1 };
const protocols = {
  bedrock: { index: 0, name: 'Bedrock', color: '#b45309' },
  eigenpie: { index: 6, name: 'Eigenpie', color: '#6d28d9' },
  etherfi: { index: 1, name: 'ether.fi', color: '#f6a550' },
  euclid: { index: 9, name: 'Euclid', color: '#5b21b6' },
  inception: { index: 4, name: 'Inception', color: '#ddd6fe' },
  kelp: { index: 3, name: 'Kelp', color: '#a78bfa' },
  prime: { index: 8, name: 'Prime', color: '#db2777' },
  puffer: { index: 7, name: 'Puffer', color: '#3b0764' },
  renzo: { index: 2, name: 'Renzo', color: '#faca51' },
  swell: { index: 5, name: 'Swell', color: '#8b5cf6' }
};
const sortProtocols = (p1, p2) => {
  const i1 = protocols[p1]?.index ?? Number.MAX_SAFE_INTEGER;
  const i2 = protocols[p2]?.index ?? Number.MAX_SAFE_INTEGER;

  if (i1 < i2) {
    return -1;
  }

  if (i1 > i2) {
    return 1;
  }

  return 0;
};
const tabMap = {
  '1w': 7,
  '1m': 30,
  '3m': 90,
  '1y': 365,
  all: Number.MAX_SAFE_INTEGER
};
// eslint-disable-next-line no-undef
const tooltipCurFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0
});
// eslint-disable-next-line no-undef
const tooltipDateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
});
