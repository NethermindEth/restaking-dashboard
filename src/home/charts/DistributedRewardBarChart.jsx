import React, { useEffect, useRef, useState } from 'react';
import { BarStack } from '@visx/shape';
import { Group } from '@visx/group';
import { Grid } from '@visx/grid';
import { AxisBottom, AxisRight } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { timeFormat } from '@visx/vendor/d3-time-format';
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

const keys = ['WETH', 'ARPA', 'Eigenlayer'];

const formatDate = timeFormat('%b %y');

const getDate = (d) => d.date;

const colorScale = scaleOrdinal({
  domain: keys,
  range: [purple1, purple2, purple3],
});

export function DistributedRewardBarChart({ jsonData = [] }) {

  const distributedRewards = jsonData.map(entry => ({
    date: new Date(entry.timestamp),
    'WETH': parseFloat(entry.tokens.find(t => t.symbol === 'WETH')?.amountETH || '0'),
    'ARPA': parseFloat(entry.tokens.find(t => t.symbol === 'ARPA')?.amountETH || '0'),
    'Eigenlayer': parseFloat(entry.tokens.find(t => t.symbol === '0xec53bf9167f50cdeb3ae105f56099aaab9061f83')?.amountETH || '0'),
  })).reverse();

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
      keys.reduce((sum, key) => sum + d[key], 0)
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
                        tooltipTop: eventSvgCoords?.y * 2,
                        tooltipLeft: eventSvgCoords?.x * 1.2,
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
          tickFormat={(date) => formatDate(date)}
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
          <div>{tooltipData.bar.data[tooltipData.key].toFixed(6)} ETH</div>
          <div>
            <small>{formatDate(getDate(tooltipData.bar.data))}</small>
          </div>
        </TooltipWithBounds>
      )}
    </div>
  );
}