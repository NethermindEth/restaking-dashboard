import React from 'react';
import { BarStack } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { timeParse, timeFormat } from '@visx/vendor/d3-time-format';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';
import { LegendOrdinal } from '@visx/legend';
import { localPoint } from '@visx/event';

const tvlOverTime = [
  {
    date: '2024-06-01',
    'Native Token': '100',
    LST: '60',
    'Eigen Token': '20'
  },
  {
    date: '2024-06-02',
    'Native Token': '105',
    LST: '65',
    'Eigen Token': '22'
  },
  {
    date: '2024-06-03',
    'Native Token': '110',
    LST: '70',
    'Eigen Token': '25'
  },
  {
    date: '2024-06-04',
    'Native Token': '115',
    LST: '75',
    'Eigen Token': '27'
  },
  {
    date: '2024-06-05',
    'Native Token': '120',
    LST: '80',
    'Eigen Token': '30'
  },
  {
    date: '2024-06-06',
    'Native Token': '125',
    LST: '85',
    'Eigen Token': '32'
  },
  {
    date: '2024-06-07',
    'Native Token': '130',
    LST: '90',
    'Eigen Token': '35'
  },
  {
    date: '2024-06-08',
    'Native Token': '135',
    LST: '95',
    'Eigen Token': '37'
  },
  {
    date: '2024-06-09',
    'Native Token': '140',
    LST: '100',
    'Eigen Token': '40'
  },
  {
    date: '2024-06-10',
    'Native Token': '145',
    LST: '105',
    'Eigen Token': '42'
  },
  {
    date: '2024-06-11',
    'Native Token': '150',
    LST: '110',
    'Eigen Token': '45'
  },
  {
    date: '2024-06-12',
    'Native Token': '155',
    LST: '115',
    'Eigen Token': '47'
  },
  {
    date: '2024-06-13',
    'Native Token': '160',
    LST: '120',
    'Eigen Token': '50'
  },
  {
    date: '2024-06-14',
    'Native Token': '165',
    LST: '125',
    'Eigen Token': '52'
  },
  {
    date: '2024-06-15',
    'Native Token': '170',
    LST: '130',
    'Eigen Token': '55'
  },
  {
    date: '2024-06-16',
    'Native Token': '175',
    LST: '135',
    'Eigen Token': '57'
  },
  {
    date: '2024-06-17',
    'Native Token': '180',
    LST: '140',
    'Eigen Token': '60'
  },
  {
    date: '2024-06-18',
    'Native Token': '185',
    LST: '145',
    'Eigen Token': '62'
  },
  {
    date: '2024-06-19',
    'Native Token': '190',
    LST: '150',
    'Eigen Token': '65'
  },
  {
    date: '2024-06-20',
    'Native Token': '195',
    LST: '155',
    'Eigen Token': '67'
  },
  {
    date: '2024-06-21',
    'Native Token': '205',
    LST: '165',
    'Eigen Token': '78'
  }
];

const purple1 = '#AE7EDE';
const purple2 = '#7828C8';
export const purple3 = '#C9A9E9';
const defaultMargin = { top: 40, right: 0, bottom: 0, left: 0 };
const tooltipStyles = {
  ...defaultStyles,
  minWidth: 100,
  color: 'black'
};

const data = tvlOverTime;
const keys = Object.keys(data[0]).filter(d => d !== 'date');

const tvlsTotal = data.reduce((allTotals, currentDate) => {
  const totalTemperature = keys.reduce((dailyTotal, k) => {
    dailyTotal += Number(currentDate[k]);
    return dailyTotal;
  }, 0);
  allTotals.push(totalTemperature);
  return allTotals;
}, []);

const parseDate = timeParse('%Y-%m-%d');
const format = timeFormat('%b %d');
const formatDate = date => format(parseDate(date));

// accessors
const getDate = d => d.date;

// scales
const dateScale = scaleBand({
  domain: data.map(getDate),
  padding: 0.2
});

const tvlScale = scaleLinear({
  domain: [0, Math.max(...tvlsTotal)],
  nice: true
});
const colorScale = scaleOrdinal({
  domain: keys,
  range: [purple1, purple2, purple3]
});

let tooltipTimeout;

const RestakerTrend = ({ width, height, margin = defaultMargin }) => {
  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip
  } = useTooltip();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true
  });

  const xMax = width;
  const yMax = height - margin.top - 100;

  dateScale.rangeRound([0, xMax]);
  tvlScale.range([yMax, 0]);

  return (
    <div className="w-full relative px-4">
      <svg ref={containerRef} className="w-full max-w-full" height={400}>
        <Group top={margin.top}>
          <BarStack
            data={data}
            keys={keys}
            x={getDate}
            xScale={dateScale}
            yScale={tvlScale}
            color={colorScale}
          >
            {barStacks =>
              barStacks.map(barStack =>
                barStack.bars.map(bar => (
                  <rect
                    key={`bar-stack-${barStack.index}-${bar.index}`}
                    x={bar.x + 14}
                    y={bar.y}
                    height={bar.height}
                    width={16}
                    fill={bar.color}
                    onMouseLeave={() => {
                      tooltipTimeout = window.setTimeout(() => {
                        hideTooltip();
                      }, 300);
                    }}
                    onMouseMove={event => {
                      if (tooltipTimeout) clearTimeout(tooltipTimeout);
                      const eventSvgCoords = localPoint(event);
                      const left = bar.x + bar.width / 2;
                      showTooltip({
                        tooltipData: bar,
                        tooltipTop: eventSvgCoords?.y,
                        tooltipLeft: left
                      });
                    }}
                  />
                ))
              )
            }
          </BarStack>
        </Group>
        <AxisLeft
          top={40}
          scale={tvlScale}
          tickValues={[0, 100, 200, 300]}
          stroke={'#7A86A5'}
          tickStroke={'#7A86A5'}
          tickLabelProps={{
            fill: '#7A86A5',
            fontSize: 11,
            textAnchor: 'middle'
          }}
        />
        <AxisBottom
          top={yMax + margin.top}
          scale={dateScale}
          tickFormat={formatDate}
          stroke={'#7A86A5'}
          tickStroke={'#7A86A5'}
          tickLabelProps={{
            fill: '#7A86A5',
            fontSize: 11,
            textAnchor: 'middle'
          }}
        />
      </svg>
      <div className="p-4 space-y-4 -mt-16">
        <LegendOrdinal
          scale={colorScale}
          shape="circle"
          direction="row"
          className="flex items-center justify-between w-full text-foreground-active text-sm "
        />
      </div>
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={tooltipStyles}
          className="space-y-2"
        >
          <div
            className="uppercase"
            style={{ color: colorScale(tooltipData.key) }}
          >
            <strong>{tooltipData.key}</strong>
          </div>
          <div className="text-lg">{tooltipData.bar.data[tooltipData.key]}</div>
          <div>
            <small>{formatDate(getDate(tooltipData.bar.data))}</small>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
};

export default RestakerTrend;
