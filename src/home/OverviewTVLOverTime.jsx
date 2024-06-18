import React from 'react';
import { BarStack } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { timeParse, timeFormat } from '@visx/vendor/d3-time-format';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';
import { LegendOrdinal } from '@visx/legend';
import { localPoint } from '@visx/event';
import GraphTimelineSelector from '../shared/GraphTimelineSelector';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';
import { Card } from '@nextui-org/react';

const tvlOverTime = [
  {
    date: '2024-06-01',
    native: '100',
    lst: '60',
    eigen: '20'
  },
  {
    date: '2024-06-02',
    native: '105',
    lst: '65',
    eigen: '22'
  },
  {
    date: '2024-06-03',
    native: '110',
    lst: '70',
    eigen: '25'
  },
  {
    date: '2024-06-04',
    native: '115',
    lst: '75',
    eigen: '27'
  },
  {
    date: '2024-06-05',
    native: '120',
    lst: '80',
    eigen: '30'
  },
  {
    date: '2024-06-06',
    native: '125',
    lst: '85',
    eigen: '32'
  },
  {
    date: '2024-06-07',
    native: '130',
    lst: '90',
    eigen: '35'
  },
  {
    date: '2024-06-08',
    native: '135',
    lst: '95',
    eigen: '37'
  },
  {
    date: '2024-06-09',
    native: '140',
    lst: '100',
    eigen: '40'
  },
  {
    date: '2024-06-10',
    native: '145',
    lst: '105',
    eigen: '42'
  },
  {
    date: '2024-06-11',
    native: '150',
    lst: '110',
    eigen: '45'
  },
  {
    date: '2024-06-12',
    native: '155',
    lst: '115',
    eigen: '47'
  },
  {
    date: '2024-06-13',
    native: '160',
    lst: '120',
    eigen: '50'
  },
  {
    date: '2024-06-14',
    native: '165',
    lst: '125',
    eigen: '52'
  },
  {
    date: '2024-06-15',
    native: '170',
    lst: '130',
    eigen: '55'
  },
  {
    date: '2024-06-16',
    native: '175',
    lst: '135',
    eigen: '57'
  },
  {
    date: '2024-06-17',
    native: '180',
    lst: '140',
    eigen: '60'
  },
  {
    date: '2024-06-18',
    native: '185',
    lst: '145',
    eigen: '62'
  },
  {
    date: '2024-06-19',
    native: '190',
    lst: '150',
    eigen: '65'
  },
  {
    date: '2024-06-20',
    native: '195',
    lst: '155',
    eigen: '67'
  },
  {
    date: '2024-06-21',
    native: '100',
    lst: '60',
    eigen: '20'
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

export default function OverviewTVLOverTime({
  width,
  height,
  margin = defaultMargin
}) {
  const [state, dispatch] = useMutativeReducer(reduceState, {
    selectedTab: '7days'
  });

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

  const handleTabChange = tab => {
    dispatch({ selectedTab: tab });
  };

  return (
    <Card
      radius="md"
      className="bg-content1 border border-outline space-y-4 p-4 w-full flex items-start flex-col justify-center"
    >
      <div className="flex items-start justify-between w-full flex-wrap gap-3">
        <div className="space-y-2">
          <div className="font-light text-base text-foreground-active px-2">
            TVL over time
          </div>
          <div className="font-light text-base text-foreground-2 px-2">
            1,479,349 ETH
          </div>
        </div>

        <GraphTimelineSelector
          timelineTab={state.selectedTab}
          onTimelineChange={handleTabChange}
        />
      </div>

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
            className="flex items-center justify-between w-full text-foreground-active text-sm uppercase"
          />
          <div className="text-foreground-2 text-xs">
            Due to the expanding pool of Liquid Staking Tokens {`(LST)`} and
            Liquid Restaking Tokens {`(LRT)`}, the TVL value on this dashboard
            may not always match the actual TVL of the entire token pool. Refer
            to the dashboard token list for the current LST and LRT data
            included in the TVL calculation.
          </div>
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
            <div className="text-lg">
              {tooltipData.bar.data[tooltipData.key]}
            </div>
            <div>
              <small>{formatDate(getDate(tooltipData.bar.data))}</small>
            </div>
          </TooltipInPortal>
        )}
      </div>
    </Card>
  );
}
