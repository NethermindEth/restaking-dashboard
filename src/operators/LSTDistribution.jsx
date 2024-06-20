import { useState, useMemo, useEffect } from 'react';
import { Pie } from '@visx/shape';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { Progress } from '@nextui-org/react';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';
import { formatEther } from 'ethers';

const coins = [
  { symbol: 'ADA', amount: 160, color: '#9C4FD9', inUSD: 122.48 },
  { symbol: 'SOL', amount: 100, color: '#7BD94F', inUSD: 327.6 },
  { symbol: 'BTA', amount: 80, color: '#AE7EDE', inUSD: 27363 },
  { symbol: 'BTB', amount: 60, color: '#D94FB2', inUSD: 4363 },
  { symbol: 'BTD', amount: 50, color: '#4FC0D9', inUSD: 1363 },
  { symbol: 'BTE', amount: 40, color: '#D9B24F', inUSD: 363 },
  { symbol: 'BTF', amount: 30, color: '#D9D34F', inUSD: 563 }
];

const lstTokenMapping = {
  '0x54945180db7943c0ed0fee7edab2bd24620256bc': 'cbETH',
  '0x93c4b944d05dfe6df7645a86cd2206016c51564d': 'stETH',
  '0x1bee69b7dfffa4e2d53c2a2df135c388ad25dcd2': 'rETH',
  '0x9d7ed45ee2e8fc5482fa2428f15c971e6369011d': 'ETHx',
  '0x13760f50a9d7377e4f20cb8cf9e4c26586c658ff': 'ankrETH',
  '0xa4c637e0f704745d182e4d38cab7e7485321d059': 'OETH',
  '0x57ba429517c3473b6d34ca9acd56c0e735b94c02': 'osETH',
  '0x0fe4f44bee93503346a3ac9ee5a26b130a5796d6': 'swETH',
  '0x7ca911e83dabf90c90dd3de5411a10f1a6112184': 'wBETH',
  '0x8ca7a5d6f3acd3a7a8bc468a8cd0fb14b6bd28b6': 'sfrxETH',
  '0xae60d8180437b5c34bb956822ac2710972584473': 'lsETH',
  '0x298afb19a105d59e74658c4c334ff360bade6dd2': 'mETH',
  '0xbeac0eeeeeeeeeeeeeeeeeeeeeeeeeeeeeebeac0': 'ETH',
  '0xacb55c530acdb2849e6d4f36992cd8c9d50ed8f7': 'EIGEN'
};

const LSTDistribution = ({ strategies, operatorTVL }) => {
  const [state, dispatch] = useMutativeReducer(reduceState, {
    opStrategies: []
  });
  const [active, setActive] = useState(null);
  const width = 200;
  const half = width / 2;

  const total = useMemo(
    () =>
      Math.floor(
        coins.reduce((acc, coin) => acc + coin.amount * coin.inUSD, 0)
      ),
    []
  );

  const sortStrategies = strategies => {
    if (strategies) {
      const filteredStrategies = strategies.filter(
        s => s.address !== '0xacb55c530acdb2849e6d4f36992cd8c9d50ed8f7'
      );

      if (filteredStrategies.length > 0) {
        filteredStrategies.sort((a, b) => {
          const tokensDiff = BigInt(b.tokens) - BigInt(a.tokens);
          if (tokensDiff > 0) {
            return 1;
          } else if (tokensDiff < 0) {
            return -1;
          } else {
            return 0;
          }
        });

        const sortedStrategies = filteredStrategies.slice(0, 6);

        if (filteredStrategies.length > 7) {
          const others = filteredStrategies.slice(6).reduce(
            (acc, current) => {
              acc.tokens += BigInt(current.tokens);
              acc.shares += BigInt(current.shares);

              return acc;
            },
            { tokens: BigInt(0), shares: BigInt(0) }
          );

          sortedStrategies.push(others);
        }

        for (let i = 0; i < sortedStrategies.length; i++) {
          if (sortedStrategies[i].address) {
            sortedStrategies[i].token =
              lstTokenMapping[sortedStrategies[i].address];
          } else {
            sortedStrategies[i].token = 'Others';
          }
        }

        dispatch({ opStrategies: sortedStrategies });
      }
    }
  };

  useEffect(() => {
    sortStrategies(strategies);
  }, [strategies]);

  return (
    <div className="flex">
      <div className="w-1/2 flex flex-col gap-y-3">
        {state.opStrategies.map((strategy, i) => (
          <LSTShare
            key={`lst-distribution-item-${i}`}
            label={strategy.token}
            value={
              (parseFloat(formatEther(strategy.tokens)) /
                parseFloat(formatEther(operatorTVL))) *
              100
            }
          />
        ))}
      </div>
      <div className="w-1/2 flex flex-row items-center justify-end px-4">
        <svg width={width} height={width}>
          <Group top={half} left={half} className="relative">
            <Pie
              data={coins}
              pieValue={data => data.amount * data.inUSD}
              outerRadius={half}
              innerRadius={({ data }) => {
                const size = 30;
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
                <Text textAnchor="middle" fill="#fff" fontSize={18} dy={0}>
                  {`$${Math.floor(active.amount * active.inUSD)}`}
                </Text>

                <Text
                  textAnchor="middle"
                  fill={active.color}
                  fontSize={14}
                  dy={20}
                >
                  $ 3,120,070,554
                </Text>
              </>
            ) : (
              <>
                <Text textAnchor="middle" fill="#fff" fontSize={18} dy={0}>
                  {`$${total}`}
                </Text>

                <Text
                  className="fill-success"
                  textAnchor="middle"
                  fontSize={14}
                  dy={20}
                >
                  $ 3,120,070,554
                </Text>
              </>
            )}
          </Group>
        </svg>
      </div>
    </div>
  );
};

export default LSTDistribution;

const LSTShare = ({ label, value }) => {
  return (
    <Progress
      radius="sm"
      classNames={{
        base: 'max-w-md',
        track: 'drop-shadow-md border bg-cinder-blue-200  border-default',
        indicator: 'bg-cinder-blue-100',
        label: 'text-foreground-2 text-xs font-normal',
        value: 'text-white text-xs font-normal'
      }}
      label={label}
      value={value}
      showValueLabel={true}
    />
  );
};
