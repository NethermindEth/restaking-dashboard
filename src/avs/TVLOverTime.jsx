import { cn } from '@nextui-org/react';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridColumns, GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { useScreenSize } from '@visx/responsive';
import { scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';
import React, { useMemo } from 'react';

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

const margin = { top: 20, right: 20, bottom: 20, left: 40 };

const TVLOverTime = () => {
  const { width } = useScreenSize();
  const height = Math.min(250, width * 0.4);

  const xScale = useMemo(() => {
    return scaleLinear({
      domain: [0, Math.max(...data.map(d => d.x))],
      range: [margin.left, width - margin.right]
    });
  }, [width]);

  const yScale = useMemo(() => {
    return scaleLinear({
      domain: [0, 300],
      range: [height - margin.bottom, margin.top]
    });
  }, [height]);

  return (
    <div className={cn('w-full', `h-[${height}px] max-h-[250px]`)}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <GridRows
          scale={yScale}
          width={width - margin.left - margin.right}
          height={height - margin.top - margin.bottom}
          left={margin.left}
          top={margin.top}
          stroke="#7A86A5"
          strokeOpacity={0.2}
          numTicks={4}
        />
        <GridColumns
          scale={xScale}
          width={width - margin.left - margin.right}
          height={height - margin.top - margin.bottom}
          left={margin.left}
          top={margin.top}
          stroke="#7A86A5"
          strokeOpacity={0.2}
          numTicks={10}
        />
        <AxisLeft
          scale={yScale}
          top={margin.top - 16}
          left={margin.left}
          tickValues={[100, 200, 300]}
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
