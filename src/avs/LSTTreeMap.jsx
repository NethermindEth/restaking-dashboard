import { Card } from '@nextui-org/react';
import { Group } from '@visx/group';
import { Treemap, hierarchy, treemapBinary } from '@visx/hierarchy';
import { scaleLinear } from '@visx/scale';
import { Text } from '@visx/text';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import React, { useMemo } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';
import { assetFormatter } from '../utils';

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

  return (
    <Card
      radius="md"
      className="bg-content1 border border-outline space-y-4 p-4 w-full flex items-start flex-col justify-center"
    >
      <div className="flex items-center justify-between w-full flex-wrap gap-3">
        <div className="font-light text-base text-foreground-1 px-2">
          {state.selectedTab === 'all-assets'
            ? 'All assets distribution'
            : state.selectedTab === 'lst'
              ? 'LST distribution'
              : 'All Assets'}
        </div>

        <div className="border border-outline p-2 rounded-lg w-full md:w-fit flex items-center gap-3">
          <div
            className={`text-center text-foreground-2 rounded-md py-1 px-6 min-w-fit w-full md:w-32 cursor-pointer ${
              state.selectedTab === 'all-assets' &&
              'bg-default border border-outline text-foreground-active'
            }`}
            onClick={() => handleTabChange('all-assets')}
          >
            All Assets
          </div>

          <div
            className={`text-center text-foreground-2 rounded-md py-1 px-6 min-w-fit w-full md:w-32 cursor-pointer ${
              state.selectedTab === 'lst' &&
              'bg-default border border-outline text-foreground-active'
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
                        onPointerEnter={event => {
                          const { clientX, clientY } = event;
                          const { left, top } =
                            event.currentTarget.getBoundingClientRect();
                          showTooltip({
                            tooltipData: node.data,
                            tooltipLeft: clientX - left,
                            tooltipTop: clientY - top
                          });
                        }}
                        onPointerMove={event => {
                          const { clientX, clientY } = event;
                          const { left, top } =
                            event.currentTarget.getBoundingClientRect();
                          showTooltip({
                            tooltipData: node.data,
                            tooltipLeft: clientX - left,
                            tooltipTop: clientY - top
                          });
                        }}
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
          className="backdrop-blur bg-white/75 dark:bg-black/75 p-2 rounded min-w-40 shadow-md text-foreground"
        >
          <div className="text-sm">
            {tooltipData.name}{' '}
            <span className="text-xs">{`(${tooltipData.token})`}</span>
          </div>
          <div className="text-base">
            TVL: {assetFormatter.format(tooltipData.tvl)}
          </div>
        </TooltipInPortal>
      )}
    </Card>
  );
}
