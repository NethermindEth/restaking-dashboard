import React, { useEffect, useRef, useState } from 'react';
import { BarStack } from '@visx/shape';
import { Group } from '@visx/group';
import { Grid } from '@visx/grid';
import { AxisBottom, AxisRight } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { timeParse, timeFormat } from '@visx/vendor/d3-time-format';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';

const purple1 = '#AE7EDE';
const purple2 = '#9353D3';
const purple3 = '#C9A9E9';
const tooltipStyles = {
  ...defaultStyles,
  minWidth: 60,
  backgroundColor: 'rgba(0,0,0,0.9)',
  color: 'white',
};

const distributedRewards = [
  {
    date: '20230701',
    'Native Token': '5.2',
    'LST': '3.8',
    'EIGEN Token': '2.1',
  },
  {
    date: '20230715',
    'Native Token': '6.1',
    'LST': '4.2',
    'EIGEN Token': '2.5',
  },
  {
    date: '20230801',
    'Native Token': '5.8',
    'LST': '4.5',
    'EIGEN Token': '2.3',
  },
  {
    date: '20230815',
    'Native Token': '6.3',
    'LST': '4.1',
    'EIGEN Token': '2.7',
  },
  {
    date: '20230901',
    'Native Token': '7.2',
    'LST': '4.8',
    'EIGEN Token': '3.1',
  },
  {
    date: '20230915',
    'Native Token': '8.1',
    'LST': '5.2',
    'EIGEN Token': '3.5',
  },
  {
    date: '20231001',
    'Native Token': '9.5',
    'LST': '6.1',
    'EIGEN Token': '4.2',
  },
  {
    date: '20231015',
    'Native Token': '10.2',
    'LST': '6.8',
    'EIGEN Token': '4.7',
  },
  {
    date: '20231101',
    'Native Token': '11.8',
    'LST': '7.5',
    'EIGEN Token': '5.3',
  },
  {
    date: '20231115',
    'Native Token': '13.1',
    'LST': '8.2',
    'EIGEN Token': '5.9',
  },
  {
    date: '20231201',
    'Native Token': '14.5',
    'LST': '9.1',
    'EIGEN Token': '6.4',
  },
  {
    date: '20231215',
    'Native Token': '16.2',
    'LST': '10.3',
    'EIGEN Token': '7.1',
  },
  {
    date: '20240101',
    'Native Token': '18.1',
    'LST': '11.5',
    'EIGEN Token': '7.8',
  },
  {
    date: '20240115',
    'Native Token': '20.3',
    'LST': '12.8',
    'EIGEN Token': '8.6',
  },
  {
    date: '20240201',
    'Native Token': '22.7',
    'LST': '14.2',
    'EIGEN Token': '9.5',
  },
  {
    date: '20240215',
    'Native Token': '24.9',
    'LST': '15.7',
    'EIGEN Token': '10.3',
  },
  {
    date: '20240301',
    'Native Token': '26.8',
    'LST': '16.9',
    'EIGEN Token': '11.1',
  },
  {
    date: '20240315',
    'Native Token': '28.4',
    'LST': '17.8',
    'EIGEN Token': '11.8',
  },
  {
    date: '20240401',
    'Native Token': '30.1',
    'LST': '18.9',
    'EIGEN Token': '12.5',
  },
  {
    date: '20240415',
    'Native Token': '31.5',
    'LST': '19.7',
    'EIGEN Token': '13.1',
  },
];

const keys = ['Native Token', 'LST', 'EIGEN Token'];

const totalRewards = distributedRewards.reduce((total, day) => {
  keys.forEach(key => {
    total += parseFloat(day[key]);
  });
  return total;
}, 0);

const parseDate = timeParse('%Y%m%d');
const formatDate = timeFormat('%b %y');

const getDate = (d) => d.date;

const colorScale = scaleOrdinal({
  domain: keys,
  range: [purple1, purple2, purple3],
});

export default function DistributedRewardChart() {
  const [width, setWidth] = useState(0);
  const containerRef = useRef(null);
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip();

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        setWidth(entries[0].contentRect.width);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const height = 400;
  const margin = { top: 40, right: 60, bottom: 40, left: 50 };

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const dateScale = scaleBand({
    domain: distributedRewards.map(getDate),
    padding: 0.6,
  });

  const rewardScale = scaleLinear({
    domain: [0, Math.max(...distributedRewards.map(d =>
      keys.reduce((sum, key) => sum + parseFloat(d[key]), 0)
    )) * 1.1],
    nice: true,
  });

  dateScale.rangeRound([0, xMax]);
  rewardScale.range([yMax, 0]);

  return (
    <div ref={containerRef}>
      <svg width={width} height={height} fill='none'>
        <rect x={0} y={0} width={width} height={height} rx={14} />
        <Grid
          top={margin.top}
          left={margin.left}
          xScale={dateScale}
          yScale={rewardScale}
          width={xMax}
          height={yMax}
          stroke="rgba(255,255,255,0)"
          strokeDasharray="4,4"
        />
        <Group top={margin.top} left={margin.left}>
          <BarStack
            data={distributedRewards}
            keys={keys}
            x={getDate}
            xScale={dateScale}
            yScale={rewardScale}
            color={colorScale}
          >
            {(barStacks) =>
              barStacks.map((barStack) =>
                barStack.bars.map((bar) => (
                  <rect
                    key={`bar-stack-${barStack.index}-${bar.index}`}
                    x={bar.x}
                    y={bar.y}
                    height={bar.height}
                    width={bar.width}
                    fill={bar.color}
                    onMouseLeave={hideTooltip}
                    onMouseMove={(event) => {
                      const eventSvgCoords = localPoint(event);
                      showTooltip({
                        tooltipData: bar,
                        tooltipTop: eventSvgCoords?.y*2,
                        tooltipLeft: eventSvgCoords?.x*1.2,
                      });
                    }}
                  />
                )),
              )
            }
          </BarStack>
          <AxisRight
            scale={rewardScale}
            top={0}
            left={xMax}
            axisClassName='stroke-default-2'
            tickStroke="default-2"
            tickLabelProps={{
              fontSize: 12,
              textAnchor: 'start',
              dx: '0.5em',
              fontWeight: 100,
            }}
          />
          <line
            x1={0}
            x2={xMax}
            y1={yMax}
            y2={yMax}
            stroke="white"
            strokeOpacity={0.2}
          />
        </Group>
        <AxisBottom
          top={yMax + margin.top}
          left={margin.left}
          scale={dateScale}
          tickFormat={(date) => formatDate(parseDate(date))}
          stroke="default-2"
          tickStroke="default-2"
          tickLabelProps={{
            className: "stroke-default-2",
            fontSize: 11,
            textAnchor: 'middle',
            fontWeight: 300,
          }}
        />
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
          style={tooltipStyles}
        >
          <div style={{ color: colorScale(tooltipData.key) }}>
            <strong>{tooltipData.key}</strong>
          </div>
          <div>{parseFloat(tooltipData.bar.data[tooltipData.key]).toFixed(3)} ETH</div>
          <div>
            <small>{formatDate(parseDate(getDate(tooltipData.bar.data)))}</small>
          </div>
        </TooltipWithBounds>
      )}
    </div>
  );
}