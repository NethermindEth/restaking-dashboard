import { useTooltip } from '@visx/tooltip';
import { AxisBottom, AxisRight } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { localPoint } from '@visx/event';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { scaleLinear, scaleUtc } from '@visx/scale';
import { AreaClosed, AreaStack } from '@visx/shape';
import { bisector } from '@visx/vendor/d3-array';
import { useTooltipInPortal } from '@visx/tooltip';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useMutativeReducer } from 'use-mutative';
import HBrush from '../shared/HBrush';
import { reduceState } from '../shared/helpers';
import { graphColors, STRATEGY_ASSET_MAPPING } from './helpers';
import { formatNumber } from '../utils';
import GraphTimelineSelector from '../shared/GraphTimelineSelector';

const brushSize = { height: 50, marginTop: 20 };
const margin = { top: 8, right: 40, bottom: 35, left: 1 };

const axisDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short'
});
const bisectDate = bisector(i => i.data.timestamp).left;
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
const tooltipDateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
});

export default function LSTDistributionGraph({
  data,
  rankings,
  height,
  width
}) {
  const [state, dispatch] = useMutativeReducer(reduceState, {
    currentTimeline: 'all',
    currentRate: 'usd',
    filteredData: [],
    keys: [],
    maxX: 0,
    maxY: 0
  });

  useEffect(() => {
    dispatch({
      maxX: width - margin.left - margin.right,
      maxY: height - margin.top - margin.bottom
    });
  }, [height, width]);

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
  const scaleBrushDate = useMemo(
    () =>
      scaleUtc({
        domain: [
          Math.min(...data.map(getDate)),
          Math.max(...data.map(getDate))
        ],
        range: [0, state.maxX - margin.right - 2] // y-axis and 2 for brush borders
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

              for (let strategy in d.tvl) {
                value += d.tvl[strategy];
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
        range: [0, state.maxX - margin.right]
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

              for (let strategy in d.tvl) {
                value += d.tvl[strategy];
              }

              return value * (state.currentRate === 'usd' ? d.rate : 1);
            })
          ) * 1.2 // 20% padding
        ],
        nice: true,
        range: [state.maxY - brushSize.marginTop - margin.bottom, 0]
      }),
    [state.currentRate, state.filteredData, state.maxY]
  );

  const getValue = useCallback(
    (d, strategy) => {
      return d.tvl[strategy] * (state.currentRate === 'usd' ? d.rate : 1);
    },
    [state.currentRate]
  );

  const handleBrushChange = useCallback(
    domain => {
      const { x0, x1 } = domain;
      const filtered = data.filter(s => {
        return s.timestamp >= x0 && s.timestamp <= x1;
      });

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

  useEffect(() => {
    dispatch({
      brushData: data?.map(d => {
        let value = 0;

        for (let strategy in d.tvl) {
          value += d.tvl[strategy];
        }

        return { timestamp: d.timestamp, value };
      }),
      brushPosition: {
        start: scaleBrushDate(data[0]?.timestamp),
        end: scaleBrushDate(data[data.length - 1]?.timestamp)
      },
      keys: rankings.map(ranking => ranking[0])
    });
  }, [data, dispatch, scaleBrushDate]);

  useEffect(() => {
    switch (state.currentTimeline) {
      case '7days':
        {
          const filteredData = data.slice(-7);
          dispatch({
            filteredData,
            brushPosition: {
              start: scaleBrushDate(filteredData[0].timestamp),
              end: scaleBrushDate(
                filteredData[filteredData.length - 1].timestamp
              )
            }
          });
        }
        break;
      case '30days':
        {
          const filteredData = data.slice(-30);
          dispatch({
            filteredData,
            brushPosition: {
              start: scaleBrushDate(filteredData[0].timestamp),
              end: scaleBrushDate(
                filteredData[filteredData.length - 1].timestamp
              )
            }
          });
        }
        break;
      default:
        dispatch({
          filteredData: data,
          brushPosition: {
            start: scaleBrushDate(data[0]?.timestamp),
            end: scaleBrushDate(data[data.length - 1]?.timestamp)
          }
        });
    }
  }, [data, state.currentTimeline]);

  const handleTimelineChange = useCallback(
    timeline => {
      dispatch({ currentTimeline: timeline });
    },
    [dispatch]
  );

  const handleRateChange = useCallback(
    rate => {
      dispatch({ currentRate: rate });
    },
    [dispatch]
  );

  return (
    <div>
      <div className="flex flex-col items-start justify-center space-y-4 rounded-lg border border-outline bg-content1 p-4">
        <div className="flex w-full flex-col justify-between gap-y-4 sm:flex-row">
          <RateSelector
            rate={state.currentRate}
            onRateChange={handleRateChange}
          />
          <GraphTimelineSelector
            timelineTab={state.currentTimeline}
            onTimelineChange={handleTimelineChange}
          />
        </div>
        <div className="relative">
          <svg
            ref={containerRef}
            height={height}
            width={width}
            className="w-full touch-pan-y"
          >
            <Group top={margin.top} left={margin.left}>
              <GridRows
                className="[&_line]:stroke-primary-50 dark:[&_line]:stroke-primary-900 dark:[&_line]:opacity-10"
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
                  stacks.map((stack, i) => (
                    <path
                      key={`stack-${stack.key}`}
                      d={path(stack) || ''}
                      fill={graphColors[i]}
                      onPointerEnter={e => handleAreaPointerMove(e, stack)}
                      onPointerLeave={hideTooltip}
                      onPointerMove={e => handleAreaPointerMove(e, stack)}
                      stroke={graphColors[i]}
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
                left={state.maxX - margin.right}
                numTicks={4}
                scale={scaleValue}
                tickFormat={value => formatNumber(value, true, 0)}
                tickClassName="[&_line]:stroke-foreground-2"
                tickLabelProps={{
                  className: 'text-xs',
                  fill: 'hsl(var(--app-foreground))',
                  fontFamily: undefined,
                  fontSize: undefined
                }}
              />
              <AxisBottom
                axisLineClassName="stroke-foreground-2"
                numTicks={
                  state.filteredData.length > 10
                    ? Math.round(state.maxX / 120)
                    : state.filteredData.length
                }
                scale={scaleDate}
                tickClassName="[&_line]:stroke-foreground-2"
                tickFormat={formatDate}
                tickLabelProps={{
                  className: 'text-xs',
                  fill: 'hsl(var(--app-foreground))',
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
                y={d => scaleBrushValue(d.value) ?? 0}
                yScale={scaleBrushValue}
              />
            </Group>
          </svg>
          <div
            className="absolute bottom-px border border-primary-50 dark:border-primary-700/25"
            style={{
              height: brushSize.height,
              width: state.maxX - margin.right
            }}
          >
            <HBrush
              brushClassName="bg-secondary-100/35 h-full"
              brushPosition={state.brushPosition}
              onChange={handleBrushChange}
              scale={scaleBrushDate}
              trackClassName="absolute h-full w-full"
            />
          </div>
        </div>
        <ul className="mt-4 w-full pe-8">
          {state.keys?.map((key, i) => (
            <li key={key} className="me-4 inline-block">
              <div className="flex flex-row items-center gap-1 text-sm">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: graphColors[i] }}
                ></span>
                {STRATEGY_ASSET_MAPPING[key]?.compact ?? key}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {tooltipOpen && (
        <TooltipInPortal
          key={Math.random()}
          applyPositionStyle={true}
          className="min-w-40 rounded bg-white/75 p-2 text-foreground shadow-md backdrop-blur dark:bg-black/75"
          left={tooltipLeft}
          top={tooltipTop}
          unstyled={true}
        >
          <div className="mb-2 text-xs font-bold">
            {tooltipDateFormatter.format(new Date(tooltipData.x))}
          </div>
          <ul className="text-sm">
            {state.keys?.map((key, i) => {
              return (
                <li key={`tt-${key}`}>
                  <div className="flex flex-row items-center gap-1">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: graphColors[i] }}
                    ></span>
                    <span
                      className={key === tooltipData.key ? 'font-bold' : ''}
                    >
                      {STRATEGY_ASSET_MAPPING[key]?.compact ?? key}
                    </span>
                    <span
                      className={`${key === tooltipData.key ? 'font-bold' : ''} grow ps-2 text-end`}
                    >
                      {formatNumber(
                        tooltipData.data.tvl[key] *
                          (state.currentRate === 'usd'
                            ? tooltipData.data.rate
                            : 1)
                      )}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </TooltipInPortal>
      )}
    </div>
  );
}

function RateSelector({ rate, onRateChange }) {
  return (
    <div className="flex w-full items-center gap-3 p-0">
      <span className="text-foreground-2">Volume over time in</span>
      <div className="flex w-full items-center gap-3 rounded-lg border border-outline p-2 md:w-fit">
        <div
          className={`w-full min-w-fit cursor-pointer rounded-md px-6 py-1 text-center text-foreground-2 md:w-20 ${
            rate === 'usd' &&
            'border border-outline bg-default text-foreground-active'
          }`}
          onClick={() => onRateChange('usd')}
        >
          USD
        </div>

        <div
          className={`w-full min-w-fit cursor-pointer rounded-md px-6 py-1 text-center text-foreground-2 md:w-20 ${
            rate === 'eth' &&
            'border border-outline bg-default text-foreground-active'
          }`}
          onClick={() => onRateChange('eth')}
        >
          ETH
        </div>
      </div>
    </div>
  );
}
