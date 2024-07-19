import { Card, Progress } from '@nextui-org/react';
import { Group } from '@visx/group';
import { Pie } from '@visx/shape';
import { Text } from '@visx/text';
import { useCallback, useEffect, useMemo } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import { reduceState } from '../shared/helpers';
import { formatNumber } from '../utils';

const getChartColor = index => {
  const colors = [
    '#9C4FD9',
    '#7BD94F',
    '#AE7EDE',
    '#D94FB2',
    '#4FC0D9',
    '#D9B24F',
    '#D9D34F',
    '#C9CBCF',
    '#7BC225'
  ];
  return colors[index % colors.length];
};

const lrtMapping = {
  bedrock: {
    logo: '/bedrock.jpg'
  },
  eigenpie: {
    logo: '/eigenpie.jpg'
  },
  etherfi: {
    logo: '/etherfi.jpg'
  },
  euclid: {
    logo: '/euclid.jpg'
  },
  inception: {
    logo: '/inception.png'
  },
  kelp: {
    logo: '/kelp.jpg'
  },
  prime: {
    logo: '/prime.png'
  },
  puffer: {
    logo: '/puffer.jpg'
  },
  swell: {
    logo: '/swell.jpg'
  }
};

export default function OverviewLRTDistribution({ rate }) {
  const { lrtService } = useServices();

  const [state, dispatch] = useMutativeReducer(reduceState, {
    activePieEntry: null,
    isFetchingData: false,
    lrtDistributionData: {},
    lrtData: {}
  });
  const width = 300;
  const half = width / 2;

  const fetchLRTDistribution = useCallback(async () => {
    try {
      dispatch({ isFetchingData: true });
      const data = await lrtService.getLRTDistribution();
      dispatch({ lrtDistributionData: data.protocols, isFetchingData: false });

      const updatedLRTData = Object.keys(lrtMapping).reduce((result, key) => {
        result[key] = {
          ...lrtMapping[key],
          tvl: data.protocols[key] || 0
        };
        return result;
      }, {});

      dispatch({ lrtData: updatedLRTData });
    } catch {
      // TODO: Handle error
      dispatch({
        isFetchingTopOperators: false
      });
    }
  }, [lrtService, dispatch]);

  useEffect(() => {
    fetchLRTDistribution();
  }, [fetchLRTDistribution]);

  const calculateTotalAndPercentages = useCallback(lrtData => {
    const totalTVL = Object.values(lrtData).reduce(
      (sum, { tvl }) => sum + tvl,
      0
    );

    const lrtDataWithPercentages = Object.entries(lrtData)
      // sort based on descending order of tvl
      .sort((a, b) => b[1].tvl - a[1].tvl)
      .reduce((result, [key, data]) => {
        result[key] = {
          ...data,
          percentage: (data.tvl / totalTVL) * 100
        };
        return result;
      }, {});

    return { lrtDataWithPercentages, totalTVL };
  }, []);

  const mergeSmallEntries = useCallback((data, totalTVL, threshold = 1) => {
    let mergedData = {};
    let othersData = {
      logo: '/image-group.svg',
      tvl: 0,
      percentage: 0
    };

    Object.entries(data).forEach(([key, value]) => {
      if ((value.tvl / totalTVL) * 100 >= threshold) {
        mergedData[key] = value;
      } else {
        othersData.tvl += value.tvl;
        othersData.percentage += value.percentage;
      }
    });

    if (othersData.tvl > 0) {
      mergedData['others'] = othersData;
    }

    return mergedData;
  }, []);

  const lrtPieChartData = useCallback(
    lrtData => {
      return Object.entries(lrtData).map(([name, data], index) => ({
        label: name,
        amount: data.tvl,
        color: getChartColor(index)
      }));
    },
    [getChartColor]
  );

  const { lrtDataWithPercentages, totalTVL } = useMemo(
    () => calculateTotalAndPercentages(state.lrtData),
    [state.lrtData]
  );

  const mergedLrtData = useMemo(
    () => mergeSmallEntries(lrtDataWithPercentages, totalTVL),
    [lrtDataWithPercentages, totalTVL]
  );

  const chartData = useMemo(
    () => lrtPieChartData(lrtDataWithPercentages),
    [mergedLrtData]
  );

  return (
    <Card
      radius="md"
      className="bg-content1 border border-outline space-y-4 p-4"
    >
      <div className="font-normal text-lg text-foreground-active px-2">
        LRT Distribution
      </div>

      <div className="w-full flex flex-col gap-10 lg:flex-row flex-wrap items-center justify-center lg:justify-between px-4">
        <div className="w-full md:max-w-xl space-y-3">
          {Object.entries(mergedLrtData).map(
            ([name, { logo, tvl, percentage }]) => (
              <LRTShare
                key={name}
                label={name}
                value={percentage}
                image={logo}
                share={tvl}
              />
            )
          )}
        </div>
        <svg width={width} height={width}>
          <Group top={half} left={half} className="relative">
            <Pie
              data={chartData}
              pieValue={data => data.amount}
              outerRadius={half}
              innerRadius={({ data }) => {
                const size =
                  state.activePieEntry &&
                  data.label === state.activePieEntry.label
                    ? 60
                    : 50;
                return half - size;
              }}
              cornerRadius={0}
              padAngle={0}
            >
              {pie => {
                return pie.arcs.map(arc => {
                  return (
                    <g
                      key={arc.data.label}
                      onMouseEnter={() =>
                        dispatch({ activePieEntry: arc.data })
                      }
                      onMouseLeave={() => dispatch({ activePieEntry: null })}
                      className="cursor-pointer"
                    >
                      <path d={pie.path(arc)} fill={arc.data.color}></path>
                    </g>
                  );
                });
              }}
            </Pie>

            {state.activePieEntry ? (
              <>
                <Text
                  textAnchor="middle"
                  fill="white"
                  fontWeight={500}
                  className="text-lg"
                  dy={-5}
                >
                  {`$${formatNumber(state.activePieEntry.amount * rate)}`}
                </Text>

                <Text
                  textAnchor="middle"
                  fill="#7CCB69"
                  fontWeight={500}
                  className="text-xs"
                  dy={15}
                >
                  {`${formatNumber(state.activePieEntry.amount)} ETH`}
                </Text>

                <Text
                  textAnchor="middle"
                  fill="#CAD7F9"
                  className="text-sm capitalize"
                  // extra 8 for padding
                  dy={35 + 8}
                >
                  {state.activePieEntry.label}
                </Text>
              </>
            ) : (
              <>
                <Text
                  textAnchor="middle"
                  fill="white"
                  fontWeight={500}
                  className="text-lg"
                  dy={5}
                >
                  {`$${formatNumber(totalTVL * rate)}`}
                </Text>

                <Text
                  textAnchor="middle"
                  fill="#7CCB69"
                  fontWeight={500}
                  className="text-xs"
                  dy={25}
                >
                  {`${formatNumber(totalTVL)} ETH`}
                </Text>
              </>
            )}
          </Group>
        </svg>
      </div>
    </Card>
  );
}

const LRTShare = ({ label, value, image, share }) => {
  return (
    <div className="flex items-end md:flex-row flex-col gap-2">
      <Progress
        radius="sm"
        classNames={{
          base: 'lg:w-5/6 w-full',
          track: 'drop-shadow-md border bg-cinder-1 border-default',
          indicator: 'bg-cinder-default',
          label: 'text-foreground-active text-sm font-normal capitalize',
          value: 'text-white text-xs font-normal'
        }}
        label={
          <div className="flex items-center gap-2">
            {image && <img src={image} className="size-4 rounded-full" />}{' '}
            <div>{label}</div>
          </div>
        }
        value={value}
        showValueLabel={true}
        formatOptions={{
          style: 'percent',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }}
      />
      <div className="text-sm text-foreground-2 min-w-fit ml-2">
        {formatNumber(share, true)} ETH
      </div>
    </div>
  );
};
