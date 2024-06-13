import React from 'react';
import { Group } from '@visx/group';
import { Treemap, hierarchy, stratify, treemapBinary } from '@visx/hierarchy';
import { scaleLinear } from '@visx/scale';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Link,
  Tab,
  Tabs
} from '@nextui-org/react';
import { reduceState } from '../shared/helpers';
import { useMutativeReducer } from 'use-mutative';

const mockData = [
  {
    id: 'Category',
    parent: null,
    size: 0
  },
  {
    id: 'Subcategory 1',
    parent: 'Category',
    size: 20
  },
  {
    id: 'Subcategory 2',
    parent: 'Category',
    size: 30
  },
  {
    id: 'Subcategory 3',
    parent: 'Category',
    size: 15
  },
  {
    id: 'Subcategory 4',
    parent: 'Category',
    size: 25
  },
  {
    id: 'Subcategory 5',
    parent: 'Category',
    size: 10
  },
  {
    id: 'Subcategory 6',
    parent: 'Category',
    size: 40
  },
  {
    id: 'Subcategory 7',
    parent: 'Category',
    size: 35
  },
  {
    id: 'Subcategory 8',
    parent: 'Category',
    size: 5
  },
  {
    id: 'Subcategory 9',
    parent: 'Category',
    size: 50
  },
  {
    id: 'Subcategory 10',
    parent: 'Category',
    size: 45
  },
  {
    id: 'Subcategory 11',
    parent: 'Category',
    size: 60
  },
  {
    id: 'Subcategory 12',
    parent: 'Category',
    size: 55
  }
];

const baseColor = '#465e92';
const minOpacity = 0.2;
const maxOpacity = 1;

const data = stratify()
  .id(d => d.id)
  .parentId(d => d.parent)(mockData)
  .sum(d => d.size ?? 0);

const defaultMargin = { top: 0, left: 0, right: 0, bottom: 0 };

export default function LSTDistributionGraph({
  height,
  margin = defaultMargin
}) {
  const [state, dispatch] = useMutativeReducer(reduceState, {
    selectedTab: 'all-assets'
  });

  const yMax = height - margin.top - margin.bottom;

  const root = hierarchy(data).sort((a, b) => (a.value || 0) - (b.value || 0));

  const numberOfMapBoxes = root.descendants().length - 1;

  const opacityScale = scaleLinear({
    domain: [0, numberOfMapBoxes],
    range: [minOpacity, maxOpacity]
  });

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
          LST distribution
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
          paddingInner={8}
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
                  >
                    {node.depth > 0 && (
                      <rect
                        width={nodeWidth}
                        height={nodeHeight}
                        fill={baseColor}
                        fillOpacity={opacity}
                      />
                    )}
                  </Group>
                );
              })}
            </Group>
          )}
        </Treemap>
      </svg>
    </Card>
  );
}
