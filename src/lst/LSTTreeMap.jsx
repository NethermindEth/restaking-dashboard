import React, { useCallback, useMemo } from 'react';
import { Card } from '@nextui-org/react';
import { Text } from '@visx/text';
import { Group } from '@visx/group';
import { hierarchy, Treemap, treemapBinary } from '@visx/hierarchy';
import { scaleLinear } from '@visx/scale';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import localPoint from '@visx/event/lib/localPointGeneric';
import { assetFormatter } from '../utils';

const baseColor = '#6992d1';
const minOpacity = 0.2;
const maxOpacity = 1;

const defaultMargin = { top: 0, left: 0, right: 0, bottom: 0 };

export default function LSTTreeMap({
  width,
  height,
  data,
  margin = defaultMargin
}) {
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

  const handleMouseOver = useCallback(
    (event, node) => {
      const point = localPoint(event.target.ownerSVGElement, event);
      showTooltip({
        tooltipLeft: point.x,
        tooltipTop: point.y,
        tooltipData: {
          protocol: node.data.protocol,
          value: node.data.value
        }
      });
    },
    [showTooltip, localPoint]
  );

  const children = useMemo(() => {
    const deposits = data[data.length - 1].deposits;
    const children = [];
    for (const [protocol, { cumulativeAmount }] of Object.entries(deposits)) {
      children.push({
        protocol,
        value: cumulativeAmount
      });
    }
    return children;
  }, [data]);

  const root = useMemo(
    () =>
      hierarchy({ name: 'lst', children })
        .sum(d => d.value)
        .sort((a, b) => (a.value ?? 0) - (b.value ?? 0)),
    [children]
  );

  const opacityScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, root.descendants().length - 1],
        range: [minOpacity, maxOpacity]
      }),
    [root]
  );

  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;

  return (
    <Card
      radius="md"
      className="bg-content1 border border-outline space-y-4 p-4 flex items-start flex-col justify-center w-full"
    >
      <div className="font-light text-base text-foreground-1 px-2">
        LST distribution
      </div>
      <svg ref={containerRef} height={height} className="w-full">
        <Treemap
          root={root}
          size={[xMax, yMax]}
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
                    onPointerEnter={e => handleMouseOver(e, node)}
                    onPointerMove={e => handleMouseOver(e, node)}
                    onPointerLeave={hideTooltip}
                    key={`node-${i}`}
                    top={node.y0 + margin.top}
                    left={node.x0 + margin.left}
                  >
                    {node.depth > 0 && (
                      <rect
                        width={nodeWidth}
                        height={nodeHeight}
                        fill={baseColor}
                        fillOpacity={opacity}
                      />
                    )}

                    {node.depth > 0 && nodeWidth > 75 && (
                      <Text className="fill-white" dy={'1em'} dx={'0.33em'}>
                        {node.data.protocol}
                      </Text>
                    )}
                  </Group>
                );
              })}
            </Group>
          )}
        </Treemap>
      </svg>
      {tooltipOpen && (
        <TooltipInPortal top={tooltipTop} left={tooltipLeft}>
          <div>
            <span className="text-sm">{tooltipData.protocol}</span>
          </div>
          <span className="text-sm">
            TVL: {assetFormatter.format(tooltipData.value)} ETH
          </span>
        </TooltipInPortal>
      )}
    </Card>
  );
}
