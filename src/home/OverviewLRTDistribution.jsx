import { Card, Progress } from '@nextui-org/react';
import { Group } from '@visx/group';
import { Pie } from '@visx/shape';
import { Text } from '@visx/text';
import { useMemo, useState } from 'react';
import { formatNumber } from '../utils';

const coins = [
  { symbol: 'ADA', amount: 160, color: '#9C4FD9', inUSD: 122.48 },
  { symbol: 'SOL', amount: 100, color: '#7BD94F', inUSD: 327.6 },
  { symbol: 'BTA', amount: 80, color: '#AE7EDE', inUSD: 27363 },
  { symbol: 'BTB', amount: 60, color: '#D94FB2', inUSD: 4363 },
  { symbol: 'BTD', amount: 50, color: '#4FC0D9', inUSD: 1363 },
  { symbol: 'BTE', amount: 40, color: '#D9B24F', inUSD: 363 },
  { symbol: 'BTF', amount: 30, color: '#D9D34F', inUSD: 563 }
];

export const lrtData = {
  wBETH: {
    share: 2508659,
    logo: '/wBETH.svg'
  },
  osETH: {
    share: 8375748,
    logo: '/osETH.svg'
  },
  lsETH: {
    share: 5141121,
    logo: '/lsETH.svg'
  },
  ankrETH: {
    share: 6210246,
    logo: '/ankrETH.svg'
  },
  rETH: {
    share: 6808644,
    logo: '/rETH.svg'
  },
  ETHx: {
    share: 5373195,
    logo: '/ETHx.svg'
  },
  others: {
    share: 9909455,
    logo: '/image-group.svg'
  }
};

export default function OverviewLRTDistribution() {
  const [active, setActive] = useState(null);
  const width = 300;
  const half = width / 2;

  const total = useMemo(
    () =>
      Math.floor(
        coins.reduce((acc, coin) => acc + coin.amount * coin.inUSD, 0)
      ),
    []
  );

  const totalShare = Object.values(lrtData).reduce(
    (sum, item) => sum + item.share,
    0
  );

  return (
    <Card
      radius="md"
      className="bg-content1 border border-outline space-y-4 p-4"
    >
      <div className="font-normal text-lg text-foreground-active px-2">
        LRT Distribution
      </div>

      <div className="w-full flex flex-col gap-10 md:flex-row items-center justify-between px-4">
        <div className="w-full md:max-w-xl space-y-3">
          {Object.entries(lrtData).map(([key, data], i) => (
            <LRTShare
              key={`lrt-distribution-item-${i + 1}-`}
              image={data.logo}
              label={key}
              share={data.share}
              value={(data.share / totalShare) * 100}
            />
          ))}
        </div>
        <svg width={width} height={width}>
          <Group top={half} left={half} className="relative">
            <Pie
              data={coins}
              pieValue={data => data.amount * data.inUSD}
              outerRadius={half}
              innerRadius={({ data }) => {
                const size = active && data.symbol === active.symbol ? 60 : 50;
                return half - size;
              }}
              cornerRadius={0}
              padAngle={0}
            >
              {pie => {
                return pie.arcs.map(arc => {
                  return (
                    <g
                      key={arc.data.symbol}
                      onMouseEnter={() => setActive(arc.data)}
                      onMouseLeave={() => setActive(null)}
                      className=" cursor-pointer"
                    >
                      <path d={pie.path(arc)} fill={arc.data.color}></path>
                    </g>
                  );
                });
              }}
            </Pie>

            {active ? (
              <>
                <Text
                  textAnchor="middle"
                  fill="#fff"
                  className="text-lg"
                  dy={0}
                >
                  {`$${formatNumber(Math.floor(active.amount * active.inUSD))}`}
                </Text>

                <Text
                  textAnchor="middle"
                  fill="#888"
                  className="text-sm"
                  dy={40}
                >
                  {`${active.amount} ${active.symbol}`}
                </Text>
              </>
            ) : (
              <>
                <Text
                  textAnchor="middle"
                  fill="#fff"
                  className="text-lg"
                  dy={0}
                >
                  {`$${formatNumber(total)}`}
                </Text>

                <Text
                  textAnchor="middle"
                  fill="#888"
                  className="text-sm"
                  dy={40}
                >
                  {`${coins.length} Assets`}
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
          base: 'max-w-lg',
          track: 'drop-shadow-md border bg-cinder-1 border-default',
          indicator: 'bg-cinder-default',
          label: 'text-foreground-active text-sm font-normal',
          value: 'text-white text-xs font-normal'
        }}
        label={
          <div className="flex items-center gap-2">
            {image && <img src={image} className="size-3" />} <div>{label}</div>
          </div>
        }
        value={value}
        showValueLabel={true}
      />
      <div className="text-sm text-foreground-2 min-w-fit">
        {formatNumber(share)} ETH
      </div>
    </div>
  );
};
