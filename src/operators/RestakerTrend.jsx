import React, { useEffect, useMemo } from 'react';
import { BarStack } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import {
  timeParse,
  timeFormat,
  isoFormat,
  isoParse
} from '@visx/vendor/d3-time-format';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';
import { LegendOrdinal } from '@visx/legend';
import { localPoint } from '@visx/event';
import { useServices } from '../@services/ServiceContext';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';
import { Card, CardBody, CardHeader } from '@nextui-org/react';
import GraphTimelineSelector from '../shared/GraphTimelineSelector';

const purple1 = '#AE7EDE';
const purple2 = '#7828C8';
export const purple3 = '#C9A9E9';
const defaultMargin = { top: 40, right: 0, bottom: 0, left: 0 };
const tooltipStyles = {
  ...defaultStyles,
  minWidth: 100,
  color: 'black'
};

const parseDate = timeParse('%Y-%m-%d');
const format = timeFormat('%b %d');
const formatDate = date => isoParse(date).toLocaleDateString(); //format(parseDate(date));

// accessors
const getDate = d => {
  console.log(formatDate(d.timestamp));
  return d.timestamp;
};

let tooltipTimeout;

const RestakerTrend = ({
  width,
  height,
  margin = defaultMargin,
  opAddress
}) => {
  const { operatorService } = useServices();
  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip
  } = useTooltip();

  const [{ restakerTrend, timelineTab }, dispatch] = useMutativeReducer(
    reduceState,
    {
      restakerTrend: [],
      timelineTab: '7days'
    }
  );

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true
  });

  const xMax = width;
  const yMax = height - margin.top - 100;

  const sortData = (data, tab) => {
    switch (tab) {
      case '7days':
        return data.slice(-7);
      case '30days':
        return data.slice(-30);
      default:
        return data;
    }
  };

  const sortedData = useMemo(() => {
    if (!restakerTrend) return null;
    return sortData(restakerTrend, timelineTab);
  }, [restakerTrend, timelineTab]);

  const tvlsTotal = sortedData.map(r => r.restakers);

  // scales
  const dateScale = scaleBand({
    domain: sortedData.map(getDate),
    padding: 0.2
  });

  const tvlScale = scaleLinear({
    domain: [0, Math.max(...tvlsTotal)],
    nice: true
  });
  const colorScale = scaleOrdinal({
    domain: ['restakers'],
    range: [purple2]
  });

  dateScale.rangeRound([0, xMax]);
  tvlScale.range([yMax, 0]);

  const fetchRestakerTrend = async () => {
    const restakerData = await operatorService.getRestakerTrend(opAddress);
    dispatch({ restakerTrend: restakerData });
  };
  const handleTimelineChange = tab => {
    dispatch({ timelineTab: tab });
  };

  useEffect(() => {
    fetchRestakerTrend();
  }, []);

  return (
    <Card radius="md" className="bg-content1 w-full border border-outline p-4">
      <CardHeader className="flex flex-wrap justify-between gap-3">
        <div className="space-y-2 block">
          <span className="text-foreground-2">Restaker Trend</span>
          <div className="font-light">
            <div className="text-base text-foreground-1">
              <span>4,554,567 ETH</span>
            </div>
          </div>
        </div>
        <GraphTimelineSelector
          timelineTab={timelineTab}
          onTimelineChange={handleTimelineChange}
        />
      </CardHeader>
      <CardBody>
        <div className="w-full relative px-4">
          <svg ref={containerRef} className="w-full max-w-full" height={400}>
            <Group top={margin.top}>
              <BarStack
                data={sortedData}
                keys={['restakers']}
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
              <div className="text-lg">
                {tooltipData.bar.data[tooltipData.key]}
              </div>
              <div>
                <small>{formatDate(getDate(tooltipData.bar.data))}</small>
              </div>
            </TooltipInPortal>
          )}
        </div>{' '}
      </CardBody>{' '}
    </Card>
  );
};

export default RestakerTrend;
