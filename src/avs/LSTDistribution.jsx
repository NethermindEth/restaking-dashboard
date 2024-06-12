import React from 'react';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';
import { formatNumber } from '../utils';
import { Card } from '@nextui-org/react';
import LSTDistributionGraph from './LSTDistributionGraph';

const mockLSTDistribution = [
  {
    name: 'Swell Staked Ether',
    logo: 'https://w7.pngwing.com/pngs/268/1013/png-transparent-ethereum-eth-hd-logo-thumbnail.png',
    token: 'swETH',
    tvl: {
      eth: 34554567,
      usd: 34554567
    }
  }
];

export default function LSTDistribution() {
  const compact = !useTailwindBreakpoint('md');
  return (
    <div className="w-full flex md:flex-row flex-col items-start justify-between gap-4">
      <div className="space-y-4 w-full">
        <Card
          radius="md"
          className="bg-content1 border border-outline space-y-4 p-4"
        >
          <div className="font-light text-base text-foreground-1">
            Total ETH distribution
          </div>

          <div>
            <div
              className={`flex flex-row gap-x-2 justify-between items-center p-4`}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="bg-center bg-contain bg-no-repeat h-5 rounded-full min-w-5"
                    style={{
                      backgroundImage: `url('https://w7.pngwing.com/pngs/268/1013/png-transparent-ethereum-eth-hd-logo-thumbnail.png')`
                    }}
                  />
                  <span className="text-foreground-2">Eigen</span>
                </div>
                <span className="text-foreground-active">EIGEN</span>
                <span className="text-foreground-active">43%</span>
              </div>
              <div className="font-light">
                <div className="text-base flex items-center gap-2">
                  4,554,567 ETH
                </div>
                <div className="text-sm text-foreground-2 text-end">
                  $ 34,554,567
                </div>
              </div>
            </div>
            <div
              className={`flex flex-row gap-x-2 justify-between items-center p-4`}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="bg-center bg-contain bg-no-repeat h-5 rounded-full min-w-5"
                    style={{
                      backgroundImage: `url('https://w7.pngwing.com/pngs/268/1013/png-transparent-ethereum-eth-hd-logo-thumbnail.png')`
                    }}
                  />
                  <span className="text-foreground-2">Beacon</span>
                </div>
                <span className="text-foreground-active">ETH</span>
                <span className="text-foreground-active">33%</span>
              </div>
              <div className="font-light">
                <div className="text-base flex items-center gap-2">
                  4,554,567 ETH
                </div>
                <div className="text-sm text-foreground-2 text-end">
                  $ 34,554,567
                </div>
              </div>
            </div>
            <div
              className={`flex flex-row gap-x-2 justify-between items-center p-4`}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="bg-center bg-contain bg-no-repeat h-5 rounded-full min-w-5"
                    style={{
                      backgroundImage: `url('https://w7.pngwing.com/pngs/268/1013/png-transparent-ethereum-eth-hd-logo-thumbnail.png')`
                    }}
                  />
                  <span className="text-foreground-2">
                    Liquidity staked Tokens
                  </span>
                </div>
                <span className="text-foreground-active">21%</span>
              </div>
              <div className="font-light">
                <div className="text-base flex items-center gap-2">
                  4,554,567 ETH
                </div>
                <div className="text-sm text-foreground-2 text-end">
                  $ 34,554,567
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card
          radius="md"
          className="bg-content1 border border-outline w-full space-y-4 p-4"
        >
          <div className="font-light text-base text-foreground-1">
            LST distribution
          </div>

          <div>
            {mockLSTDistribution.map((lst, i) => (
              <div
                key={`lst-item-${i}`}
                className={`border-t border-outline flex flex-row gap-x-2 justify-between items-center p-4 hover:bg-default`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="bg-center bg-contain bg-no-repeat h-5 rounded-full min-w-5"
                      style={{
                        backgroundImage: `url('${lst.logo}')`
                      }}
                    />
                    <span className="text-foreground-2">{lst.name}</span>
                  </div>
                  <span className="text-foreground-active">{lst.token}</span>
                </div>
                <div className="font-light">
                  <div className="text-base flex items-center gap-2">
                    {formatNumber(lst.tvl.eth, compact)}ETH
                  </div>
                  <div className="text-foreground-2 text-xs text-end">
                    $ {formatNumber(lst.tvl.usd, compact)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="flex flex-col gap-4 justify-between items-end w-full">
        <LSTDistributionGraph width={500} height={500} />
      </div>
    </div>
  );
}
