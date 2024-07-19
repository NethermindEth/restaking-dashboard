import { Card } from '@nextui-org/react';
import { Group } from '@visx/group';
import { hierarchy, Treemap, treemapBinary } from '@visx/hierarchy';
import { scaleLinear } from '@visx/scale';
import { Text } from '@visx/text';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import React, { useCallback, useMemo } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';
import { assetFormatter } from '../utils';
import localPoint from '@visx/event/lib/localPointGeneric';

const baseColor = '#465e99';
const minOpacity = 0.1;
const maxOpacity = 0.9;

const defaultMargin = { top: 0, left: 0, right: 0, bottom: 0 };

export default function LSTTreeMap({
  height,
  margin = defaultMargin,
  totalEthDistributionData,
  lstDistributionData
}) {
  const [state, dispatch] = useMutativeReducer(reduceState, {
    selectedTab: 'all-assets'
  });

  const {
    hideTooltip,
    showTooltip,
    tooltipData,
    tooltipOpen,
    tooltipLeft,
    tooltipTop
  } = useTooltip();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true
  });

  const yMax = height - margin.top - margin.bottom;

  const getTreemapData = () => {
    if (state.selectedTab === 'all-assets') {
      const allData = [
        ...totalEthDistributionData.filter(
          d => d.name !== 'Liquidity Staked Tokens'
        ),
        ...lstDistributionData
      ];
      return allData;
    } else if (state.selectedTab === 'lst') {
      return lstDistributionData;
    }
    return [];
  };

  const data = getTreemapData();

  const root = useMemo(() => {
    return hierarchy({ name: 'root', children: data })
      .sum(d => d.tvl)
      .sort((a, b) => a.value - b.value);
  }, [data]);

  const numberOfMapBoxes = root.descendants().length - 1;

  const opacityScale = useMemo(() => {
    return scaleLinear({
      domain: [0, numberOfMapBoxes],
      range: [minOpacity, maxOpacity]
    });
  }, [numberOfMapBoxes]);

  const handleTabChange = tab => {
    dispatch({ selectedTab: tab });
  };

  const handleTooltip = useCallback((event, node) => {
    const point = localPoint(event.target.ownerSVGElement, event);
    showTooltip({
      tooltipData: node.data,
      tooltipLeft: point.x,
      tooltipTop: point.y
    });
  }, []);

  return (
    <Card
      radius="md"
      className="flex w-full flex-col items-start justify-center space-y-4 border border-outline bg-content1 p-4"
    >
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <div className="px-2 text-base font-light text-foreground-1">
          {state.selectedTab === 'all-assets'
            ? 'All assets distribution'
            : state.selectedTab === 'lst'
              ? 'LST distribution'
              : 'All Assets'}
        </div>

        <div className="flex w-full items-center gap-3 rounded-lg border border-outline p-2 md:w-fit">
          <div
            className={`w-full min-w-fit cursor-pointer rounded-md px-6 py-1 text-center text-foreground-2 md:w-32 ${
              state.selectedTab === 'all-assets' &&
              'border border-outline bg-default text-foreground-active'
            }`}
            onClick={() => handleTabChange('all-assets')}
          >
            All Assets
          </div>

          <div
            className={`w-full min-w-fit cursor-pointer rounded-md px-6 py-1 text-center text-foreground-2 md:w-32 ${
              state.selectedTab === 'lst' &&
              'border border-outline bg-default text-foreground-active'
            }`}
            onClick={() => handleTabChange('lst')}
          >
            LST
          </div>
        </div>
      </div>
      <svg
        ref={containerRef}
        height={height}
        className="w-full overflow-x-scroll pr-2"
        style={{ marginRight: 'auto' }}
      >
        <Treemap
          top={margin.top}
          root={root}
          size={[550, yMax]}
          tile={treemapBinary}
          padding={8}
          paddingInner={1}
          round
        >
          {treemap => (
            <Group>
              {treemap.descendants().map((node, i) => {
                const nodeWidth = node.x1 - node.x0;
                const nodeHeight = node.y1 - node.y0;
                const opacity = opacityScale(i);

                return (
                  <Group
                    key={`node-${i}`}
                    top={node.y0 + margin.top}
                    left={node.x0 + margin.left}
                    className="cursor-pointer"
                  >
                    {node.depth > 0 && (
                      <rect
                        width={nodeWidth}
                        height={nodeHeight}
                        fill={baseColor}
                        fillOpacity={
                          tooltipData?.name === node.data.name
                            ? opacity + 0.2
                            : opacity
                        }
                        onPointerEnter={e => handleTooltip(e, node)}
                        onPointerMove={e => handleTooltip(e, node)}
                        onPointerLeave={hideTooltip}
                      />
                    )}

                    {nodeWidth > 100 && node.depth > 0 && (
                      <Text
                        dy={'40px'}
                        dx={'10px'}
                        width={nodeWidth + 10}
                        className="text-xs"
                        fill={'#ffffff'}
                      >
                        {node.data.name}
                      </Text>
                    )}
                  </Group>
                );
              })}
            </Group>
          )}
        </Treemap>
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
          className="min-w-40 rounded bg-white/75 p-2 text-foreground shadow-md backdrop-blur dark:bg-black/75"
        >
          <div className="text-sm">
            {tooltipData.name}{' '}
            <span className="text-xs">{`(${tooltipData.token})`}</span>
          </div>
          <div className="text-base">
            TVL: {assetFormatter.format(tooltipData.tvl)} ETH
          </div>
        </TooltipInPortal>
      )}
    </Card>
  );
}
