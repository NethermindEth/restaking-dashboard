import React from 'react';
import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { scaleLinear } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';

const data = [
  { x: 0, y: 200 },
  { x: 1, y: 200 },
  { x: 2, y: 80 },
  { x: 3, y: 150 },
  { x: 4, y: 200 },
  { x: 5, y: 80 },
  { x: 6, y: 100 },
  { x: 7, y: 100 },
  { x: 8, y: 75 },
  { x: 9, y: 150 }
];

const width = 2000;
const height = 220;
const margin = { top: 20, right: 20, bottom: 20, left: 40 };

const TVLOverTime = () => {
  const xScale = scaleLinear({
    domain: [0, Math.max(...data.map(d => d.x))],
    range: [margin.left, width - margin.right]
  });

  const yScale = scaleLinear({
    domain: [0, 300],
    range: [height - margin.bottom, margin.top]
  });

  return (
    <div className="flex items-center justify-center">
      <svg className="w-full" height={height}>
        <GridRows
          scale={yScale}
          width={width}
          height={height}
          stroke="#7A86A5"
          strokeOpacity={0.2}
          numTicks={4}
        />
        <GridColumns
          scale={xScale}
          width={width}
          height={height}
          stroke="#7A86A5"
          strokeOpacity={0.2}
          numTicks={10}
        />
        <AxisLeft
          scale={yScale}
          left={margin.left}
          tickValues={[0, 50, 100, 200, 300]}
          tickLabelProps={() => ({
            fill: '#7A86A5',
            fontSize: 12,
            textAnchor: 'end'
          })}
        />
        <AxisBottom
          scale={xScale}
          top={height - margin.bottom}
          tickLabelProps={() => ({
            fill: '#7A86A5',
            fontSize: 12,
            textAnchor: 'middle'
          })}
        />
        <Group>
          <LinePath
            data={data}
            x={d => xScale(d.x)}
            y={d => yScale(d.y)}
            stroke="#009CDD"
            strokeWidth={2}
          />
        </Group>
      </svg>
    </div>
  );
};

export default TVLOverTime;
