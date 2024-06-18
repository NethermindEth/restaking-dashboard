import { Card, Divider } from '@nextui-org/react';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';
import { ChevronRightIcon } from '@nextui-org/shared-icons';
import OverviewTVLOverTime from './OverviewTVLOverTime';
import OverviewLRTDistribution from './OverviewLRTDistribution';

const topAVS = [
  {
    avs: {
      name: 'EigenDa',
      logo: 'https://mainnet-ethereum-avs-metadata.s3.amazonaws.com/markEigenDA.png'
    },
    operators: 123,
    tvl: {
      eth: 34554567,
      usd: 34554567
    }
  },
  {
    avs: {
      name: 'EigenDa',
      logo: 'https://mainnet-ethereum-avs-metadata.s3.amazonaws.com/markEigenDA.png'
    },
    operators: 123,
    tvl: {
      eth: 34554567,
      usd: 34554567
    }
  },
  {
    avs: {
      name: 'EigenDa',
      logo: 'https://mainnet-ethereum-avs-metadata.s3.amazonaws.com/markEigenDA.png'
    },
    operators: 123,
    tvl: {
      eth: 34554567,
      usd: 34554567
    }
  }
];

const topOperators = [
  {
    operator: {
      name: 'EigenDa',
      logo: 'https://mainnet-ethereum-avs-metadata.s3.amazonaws.com/markEigenDA.png'
    },
    restakers: 123,
    tvl: {
      eth: 34554567,
      usd: 34554567
    }
  },
  {
    operator: {
      name: 'EigenDa',
      logo: 'https://mainnet-ethereum-avs-metadata.s3.amazonaws.com/markEigenDA.png'
    },
    restakers: 123,
    tvl: {
      eth: 34554567,
      usd: 34554567
    }
  },
  {
    operator: {
      name: 'EigenDa',
      logo: 'https://mainnet-ethereum-avs-metadata.s3.amazonaws.com/markEigenDA.png'
    },
    restakers: 123,
    tvl: {
      eth: 34554567,
      usd: 34554567
    }
  }
];

export default function Home() {
  const compact = !useTailwindBreakpoint('md');

  return (
    <div className="space-y-4">
      <div className="flex items-stretch gap-4 justify-between">
        <Card
          radius="md"
          className="bg-content1 border border-outline space-y-4 p-4 flex flex-row items-center justify-around w-full"
        >
          <div className="space-y-2 text-center">
            <div className="font-light text-sm text-foreground-1">
              EigenLayer TVL
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-normal text-white">
                1,479,349 ETH
              </div>
              <div className="font-light text-sm text-success">
                $ 3,120,070,554
              </div>
            </div>
          </div>
          <Divider orientation="vertical" className="h-12" />
          <div className="space-y-1 text-center">
            <div className="font-light text-sm text-foreground-1">
              Active AVS
            </div>
            <div className="text-2xl font-normal text-white">13</div>
          </div>
          <Divider orientation="vertical" className="h-12" />
          <div className="space-y-1 text-center">
            <div className="font-light text-sm text-foreground-1">
              Active Operators
            </div>
            <div className="text-2xl font-normal text-white">240</div>
          </div>
        </Card>
        <div className="w-2/5">
          <CTAs />
        </div>
      </div>
      <div className="flex items-stretch justify-between gap-4">
        <Card
          radius="md"
          className="bg-content1 border border-outline space-y-4 p-4 w-full"
        >
          <div className="font-light text-base text-foreground-1">Top AVS</div>
          <div className="text-sm">
            <div className="flex flex-row gap-x-2 justify-between items-center p-4 text-foreground-1">
              <span className="basis-full">AVS</span>
              <span className="basis-2/3">Operators</span>
              <span className="basis-1/2 text-end">TVL</span>
            </div>
            {topAVS.map((entry, i) => (
              <div
                key={`top-avs-item-${i}`}
                className={`border-t border-outline flex flex-row gap-x-2 justify-between items-center p-4 hover:bg-default`}
              >
                <img src={entry.avs.logo} className="size-5 rounded-full" />
                <span className="basis-full truncate">{entry.avs.name}</span>
                <span className="basis-2/3">
                  {formatNumber(entry.operators, compact)}%
                </span>
                <span className="basis-1/2 text-end">
                  <div>{formatNumber(entry.tvl.eth, compact)} ETH</div>
                  <div className="text-foreground-1 text-xs">
                    $ {formatNumber(entry.tvl.usd, compact)}
                  </div>
                </span>
              </div>
            ))}
          </div>
        </Card>
        <Card
          radius="md"
          className="bg-content1 border border-outline space-y-4 p-4 w-full"
        >
          <div className="font-light text-base text-foreground-1">
            Top Operators
          </div>
          <div className="text-sm">
            <div className="flex flex-row gap-x-2 justify-between items-center p-4 text-foreground-1">
              <span className="basis-full">Operators</span>
              <span className="basis-2/3">Restakers</span>
              <span className="basis-1/2 text-end">TVL</span>
            </div>
            {topOperators.map((entry, i) => (
              <div
                key={`top-avs-item-${i}`}
                className={`border-t border-outline flex flex-row gap-x-2 justify-between items-center p-4 hover:bg-default`}
              >
                <img
                  src={entry.operator.logo}
                  className="size-5 rounded-full"
                />
                <span className="basis-full truncate">
                  {entry.operator.name}
                </span>
                <span className="basis-2/3">
                  {formatNumber(entry.restakers, compact)}%
                </span>
                <span className="basis-1/2 text-end">
                  <div>{formatNumber(entry.tvl.eth, compact)} ETH</div>
                  <div className="text-foreground-1 text-xs">
                    $ {formatNumber(entry.tvl.usd, compact)}
                  </div>
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <OverviewTVLOverTime width={1100} height={400} />
      <OverviewLRTDistribution />
    </div>
  );
}

const CTAs = () => {
  return (
    <div className="space-y-2">
      <Card
        radius="md"
        className="bg-cinder-1 hover:bg-cinder-1/80 cursor-pointer flex flex-row items-center justify-normal gap-3 px-4 py-2.5"
      >
        <div>
          <img src="/public/nethermind.png" />
        </div>
        <div className="space-y-1">
          <div className="text-cinder-2 font-semibold text-base">
            Start Restaking
          </div>
          <div className="text-cinder-3 text-sm font-light">
            Nethermind operator
          </div>
        </div>
        <ChevronRightIcon className="size-6 ml-2 text-cinder-3" />
      </Card>
      <Card
        radius="md"
        className="bg-cinder-1 hover:bg-cinder-1/80 cursor-pointer flex flex-row items-center justify-normal gap-3 px-4 py-2.5"
      >
        <div>
          <img src="/public/nethermind.png" />
        </div>
        <div className="space-y-1">
          <div className="text-cinder-2 font-semibold text-base">
            Audit smart contract
          </div>
          <div className="text-cinder-3 text-sm font-light">
            audit AVS with Nethermind
          </div>
        </div>
        <ChevronRightIcon className="size-6 ml-2 text-cinder-3" />
      </Card>
    </div>
  );
};

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0
});

function formatNumber(value, compact) {
  if (compact) {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}m`;
    }

    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}k`;
    }
  }

  return numberFormatter.format(value);
}
