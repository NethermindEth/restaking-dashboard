import {
  BEACON_STRATEGY,
  EIGEN_STRATEGY,
  lstStrategyAssetMapping
} from '../../shared/strategies';
import { formatETH, formatUSD } from '../../shared/formatters';
import { hierarchy, Treemap, treemapBinary } from '@visx/hierarchy';
import { Tab, Tabs } from '@nextui-org/react';
import { useCallback, useEffect, useMemo } from 'react';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { Group } from '@visx/group';
import { localPoint } from '@visx/event';
import { reduceState } from '../../shared/helpers';
import { scaleLinear } from '@visx/scale';
import { tabs } from '../../shared/slots';
import { Text } from '@visx/text';
import { useMutativeReducer } from 'use-mutative';
import { useTailwindBreakpoint } from '../../shared/hooks/useTailwindBreakpoint';

export default function TVLTabTreemap({ width, height, ethRate, lst }) {
  const compact = !useTailwindBreakpoint('sm');
  const [state, dispatch] = useMutativeReducer(reduceState, {
    maxX: Math.max(width - margin.left - margin.right, 0),
    maxY: height - margin.top - margin.bottom,
    useAllStrategies: true
  });

  useEffect(() => {
    dispatch({
      maxX: Math.max(width - margin.left - margin.right, 0),
      maxY: height - margin.top - margin.bottom
    });
  }, [dispatch, width, height]);

  const children = useMemo(() => {
    const filters = new Set();

    if (!state.useAllStrategies) {
      filters.add(EIGEN_STRATEGY);
      filters.add(BEACON_STRATEGY);
    }

    return Object.entries(lst)
      .filter(([strategy]) => !filters.has(strategy))
      .map(([strategy, value]) => ({
        name: allStrategyAssetMapping[strategy]?.name,
        symbol: allStrategyAssetMapping[strategy]?.symbol,
        value: Number(value)
      }));
  }, [lst, state.useAllStrategies]);

  const root = useMemo(
    () =>
      hierarchy({ name: 'root', children: children })
        .sum(d => d.value)
        .sort((a, b) => a.value - b.value),
    [children]
  );

  const isEmpty = useMemo(() => {
    if (root && root.children) {
      return (
        root.children.reduce((acc, child) => acc + child.data.value, 0) === 0
      );
    }

    return true;
  }, [root]);

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

  const handleTabChange = useCallback(
    key => {
      dispatch({
        useAllStrategies: key === 'all'
      });
    },
    [dispatch]
  );

  const handlePointerMove = useCallback(
    (event, node) => {
      const point = localPoint(event.target.ownerSVGElement, event);

      showTooltip({
        tooltipData: node.data,
        tooltipLeft: point?.x,
        tooltipTop: point?.y
      });
    },
    [showTooltip]
  );

  if (width < 0 || height < 0) {
    return;
  }

  return (
    <div className="rd-box h-full w-full p-4">
      <div className="mb-4 flex justify-between">
        <div className="text-medium text-foreground-1">LST distribution</div>
        {!isEmpty && (
          <Tabs
            classNames={tabs}
            defaultSelectedKey="usd"
            onSelectionChange={handleTabChange}
            size="sm"
          >
            <Tab key="all" title="All assets" />
            <Tab key="lst" title="LST" />
          </Tabs>
        )}
      </div>

      {isEmpty && (
        <div className="flex h-full items-center justify-center">
          <span className="text-lg text-foreground-2">
            No distribution to display
          </span>
        </div>
      )}

      {!isEmpty && (
        <svg height={height} ref={containerRef} width={width}>
          <Treemap
            paddingInner={1}
            root={root}
            round
            size={[state.maxX, state.maxY]}
            tile={treemapBinary}
            top={margin.top}
          >
            {treemap => (
              <Group>
                {treemap.descendants().map((node, i) => {
                  const nodeWidth = node.x1 - node.x0;
                  const nodeHeight = node.y1 - node.y0;

                  // if the node's value is 0, there is no valid box dimension
                  if (Number.isNaN(nodeWidth) || Number.isNaN(nodeHeight)) {
                    return;
                  }

                  return (
                    <Group
                      key={`node-${i}`}
                      left={node.x0 + margin.left}
                      top={node.y0 + margin.top}
                    >
                      {node.depth > 0 && (
                        <rect
                          className="fill-content3"
                          height={nodeHeight}
                          onPointerEnter={e => handlePointerMove(e, node)}
                          onPointerLeave={hideTooltip}
                          onPointerMove={e => handlePointerMove(e, node)}
                          opacity={scaleOpacity(i)}
                          width={nodeWidth}
                        />
                      )}

                      {nodeWidth > 55 && nodeHeight > 20 && (
                        <Text
                          className="fill-white text-xs"
                          dx={8}
                          dy={16}
                          width={nodeWidth}
                        >
                          {node.data.symbol}
                        </Text>
                      )}
                    </Group>
                  );
                })}
              </Group>
            )}
          </Treemap>
        </svg>
      )}

      {tooltipOpen && (
        <TooltipInPortal
          applyPositionStyle={true}
          className="rd-tooltip px-2"
          key={Math.random()}
          left={tooltipLeft}
          top={tooltipTop}
          unstyled={true}
        >
          <div className="rd-tooltip-title">
            {`${tooltipData.name} (${tooltipData.symbol})`}
          </div>
          <div>
            <div>{formatUSD(tooltipData.value * ethRate, compact)}</div>
            <div className="text-xs text-foreground-1">
              {formatETH(tooltipData.value, compact)}
            </div>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}

const margin = { top: 0, right: 0, bottom: 0, left: 0 };
const allStrategyAssetMapping = {
  ...lstStrategyAssetMapping,
  [EIGEN_STRATEGY]: { name: 'Eigen', symbol: 'EIGEN' },
  [BEACON_STRATEGY]: { name: 'Beacon', symbol: 'ETH' }
};
