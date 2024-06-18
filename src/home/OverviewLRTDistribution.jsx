import { useState, useMemo } from 'react';
import { Pie } from '@visx/shape';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { Card } from '@nextui-org/react';

const coins = [
  { symbol: 'ADA', amount: 160, color: '#9C4FD9', inUSD: 122.48 },
  { symbol: 'SOL', amount: 100, color: '#7BD94F', inUSD: 327.6 },
  { symbol: 'BTA', amount: 80, color: '#AE7EDE', inUSD: 27363 },
  { symbol: 'BTB', amount: 60, color: '#D94FB2', inUSD: 4363 },
  { symbol: 'BTD', amount: 50, color: '#4FC0D9', inUSD: 1363 },
  { symbol: 'BTE', amount: 40, color: '#D9B24F', inUSD: 363 },
  { symbol: 'BTF', amount: 30, color: '#D9D34F', inUSD: 563 }
];

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

  return (
    <Card
      radius="md"
      className="bg-content1 border border-outline space-y-4 p-4"
    >
      <div className="font-normal text-lg text-foreground-active px-2">
        LRT Distribution
      </div>

      <div className="w-full flex flex-row items-center justify-end px-4">
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
                      style={{ cursor: 'pointer' }}
                    >
                      <path d={pie.path(arc)} fill={arc.data.color}></path>
                    </g>
                  );
                });
              }}
            </Pie>

            {active ? (
              <>
                <Text textAnchor="middle" fill="#fff" fontSize={24} dy={0}>
                  {`$${Math.floor(active.amount * active.inUSD)}`}
                </Text>

                <Text
                  textAnchor="middle"
                  fill={active.color}
                  fontSize={20}
                  dy={40}
                >
                  {`${active.amount} ${active.symbol}`}
                </Text>
              </>
            ) : (
              <>
                <Text textAnchor="middle" fill="#fff" fontSize={24} dy={0}>
                  {`$${total}`}
                </Text>

                <Text textAnchor="middle" fill="#888" fontSize={20} dy={40}>
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
