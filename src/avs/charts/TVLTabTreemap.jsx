
// @ts-check

import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../../shared/helpers';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { Treemap, hierarchy, treemapBinary } from '@visx/hierarchy';
import { Group } from '@visx/group';
import { Tab, Tabs } from '@nextui-org/react';
import { tabs } from '../../shared/slots';
import { scaleLinear } from '@visx/scale';
import { Text } from '@visx/text';
import { BEACON_STRATEGY, EIGEN_STRATEGY, LST_STRATEGY_ASSET_MAPPING } from '../helpers';
import { localPoint } from '@visx/event';
import { formatETH, formatNumber, formatUSD } from '../../shared/formatters';
import { useTailwindBreakpoint } from '../../shared/useTailwindBreakpoint';

const margin = { top: 0, right: 0, bottom: 0, left: 0 };
const ALL_STRATEGY_ASSET_MAPPING = { ...LST_STRATEGY_ASSET_MAPPING, [EIGEN_STRATEGY]: { name: 'Eigen', symbol: 'EIGEN' }, [BEACON_STRATEGY]: { name: 'Beacon', symbol: 'ETH' } }

export default function TVLTabTreemap({ width, height, ethRate, lst }) {
  const compact = !useTailwindBreakpoint("sm")
  const [state, dispatch] = useMutativeReducer(reduceState, {
    maxX: Math.max(width - margin.left - margin.right, 0),
    maxY: height - margin.top - margin.bottom,
    useAllStrategies: true,
  });

  useEffect(() => {
    dispatch({
      maxX: Math.max(width - margin.left - margin.right, 0),
      maxY: height - margin.top - margin.bottom
    });
  }, [dispatch, width, height]);



  const children = useMemo(() => {
    const filters = new Set()

    if (!state.useAllStrategies) {
      filters.add(EIGEN_STRATEGY);
      filters.add(BEACON_STRATEGY)
    }

    return Object.entries(lst).filter(([strategy]) => !filters.has(strategy)).map(([strategy, value]) => ({
      name: ALL_STRATEGY_ASSET_MAPPING[strategy].name,
      symbol: ALL_STRATEGY_ASSET_MAPPING[strategy].symbol,
      value: Number(value),
    }))
  }, [lst, state.useAllStrategies]);

  const root = useMemo(
    () => hierarchy({ name: 'root', children: children }).sum(d => d.value).sort((a, b) => a.value - b.value),
    [children]
  );

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


  const scaleOpacity = useMemo(() => {
    const tileCount = root.descendants().length - 1;

    return scaleLinear({
      domain: [0, tileCount],
      range: [0.1, 0.9]
    });
  }, [root]);

  const handleTabChange = useCallback((key) => {
    dispatch({
      useAllStrategies: key === 'all'
    })
  }, [])

  const handlePointerMove = useCallback((event, node) => {
    const point = localPoint(event.target.ownerSVGElement, event);

    showTooltip({
      tooltipData: node.data,
      tooltipLeft: point.x,
      tooltipTop: point.y
    })
  }, [])

  if (width < 0 || height < 0) {
    return
  }

  return (
    <div className="bg-content1 border border-outline h-full rounded-lg w-full p-4">
      <div className="flex justify-between mb-4">
        <div className="font-display text-foreground-1 text-xl">
          LST distribution
        </div>

        <Tabs
          classNames={tabs}
          defaultSelectedKey="usd"
          onSelectionChange={handleTabChange}
          size="sm"
        >
          <Tab key="all" title="All assets" />
          <Tab key="lst" title="LST" />
        </Tabs>
      </div>
      <svg ref={containerRef} width={width} height={height}>
        <Treemap root={root} top={margin.top} size={[state.maxX, state.maxY]} tile={treemapBinary} paddingInner={1} round>{treemap => (<Group>

          {
            treemap.descendants().map((node, i) => {
              const nodeWidth = node.x1 - node.x0;
              const nodeHeight = node.y1 - node.y0;
              return (
                <Group
                  key={`node-${i}`}
                  top={node.y0 + margin.top}
                  left={node.x0 + margin.left}
                >
                  {node.depth > 0 && (
                    <rect
                      width={nodeWidth}
                      height={nodeHeight}
                      className="fill-[#465e99]"
                      opacity={scaleOpacity(i)}
                      onPointerEnter={e => handlePointerMove(e, node)}
                      onPointerMove={e => handlePointerMove(e, node)}
                      onPointerLeave={hideTooltip}

                    />
                  )}

                  {nodeWidth > 55 && nodeHeight > 20 && <Text width={nodeWidth} dy={16} dx={8} className="text-xs fill-white">{node.data.symbol}</Text>}

                </Group>
              )
            })
          }

        </Group>)}</Treemap>
      </svg>
      {tooltipOpen && (
        <TooltipInPortal
          key={Math.random()}
          applyPositionStyle={true}
          className="backdrop-blur bg-white/75 dark:bg-black/75 p-2 rounded min-w-40 shadow-md text-foreground"
          left={tooltipLeft}
          top={tooltipTop}
          unstyled={true}
        >
          <div className="font-bold mb-2 px-2 text-sm">
            {`${tooltipData.name} (${tooltipData.symbol})`}
          </div>
          <div className="text-base px-2">
            <div> {tooltipData.symbol !== 'EIGEN' ? formatUSD(tooltipData.value * ethRate, compact) : 'N/A'}</div>
            <div>
              {
                tooltipData.symbol !== 'EIGEN' ? formatETH(tooltipData.value, compact) :
                  `${formatNumber(tooltipData.value, compact)} EIGEN`
              }
            </div>
          </div>
        </TooltipInPortal>

      )}
    </div >
  );
}
