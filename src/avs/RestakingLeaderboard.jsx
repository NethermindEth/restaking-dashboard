import React from 'react';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';
import { formatDate, formatNumber } from '../utils';
import { Card, Input } from '@nextui-org/react';
import { SearchIcon } from '@nextui-org/shared-icons';

const mockdata = [
  {
    operator: {
      name: 'AltLayer',
      logo: 'https://mainnet-ethereum-avs-metadata.s3.amazonaws.com/markEigenDA.png'
    },
    share: 46,
    tvl: {
      eth: 34554567,
      usd: 34554567
    },
    joined: '2024-6-1 11:34:57.000000'
  },
  {
    operator: {
      name: 'AltLayer',
      logo: 'https://mainnet-ethereum-avs-metadata.s3.amazonaws.com/markEigenDA.png'
    },
    share: 46,
    tvl: {
      eth: 34554567,
      usd: 34554567
    },
    joined: '2024-6-10 11:34:57.000000'
  },
  {
    operator: {
      name: 'AltLayer',
      logo: 'https://mainnet-ethereum-avs-metadata.s3.amazonaws.com/markEigenDA.png'
    },
    share: 46,
    tvl: {
      eth: 34554567,
      usd: 34554567
    },
    joined: '2024-6-10 11:34:57.000000'
  },
  {
    operator: {
      name: 'AltLayer',
      logo: 'https://mainnet-ethereum-avs-metadata.s3.amazonaws.com/markEigenDA.png'
    },
    share: 46,
    tvl: {
      eth: 34554567,
      usd: 34554567
    },
    joined: '2024-6-10 11:34:57.000000'
  },
  {
    operator: {
      name: 'AltLayer',
      logo: 'https://mainnet-ethereum-avs-metadata.s3.amazonaws.com/markEigenDA.png'
    },
    share: 46,
    tvl: {
      eth: 34554567,
      usd: 34554567
    },
    joined: '2024-6-10 11:34:57.000000'
  },
  {
    operator: {
      name: 'AltLayer',
      logo: 'https://mainnet-ethereum-avs-metadata.s3.amazonaws.com/markEigenDA.png'
    },
    share: 46,
    tvl: {
      eth: 34554567,
      usd: 34554567
    },
    joined: '2024-6-10 11:34:57.000000'
  },
  {
    operator: {
      name: 'AltLayer',
      logo: 'https://mainnet-ethereum-avs-metadata.s3.amazonaws.com/markEigenDA.png'
    },
    share: 46,
    tvl: {
      eth: 34554567,
      usd: 34554567
    },
    joined: '2024-6-10 11:34:57.000000'
  },
  {
    operator: {
      name: 'AltLayer',
      logo: 'https://mainnet-ethereum-avs-metadata.s3.amazonaws.com/markEigenDA.png'
    },
    share: 46,
    tvl: {
      eth: 34554567,
      usd: 34554567
    },
    joined: '2024-6-10 11:34:57.000000'
  }
];

export default function RestakingLeaderboard() {
  const compact = !useTailwindBreakpoint('md');
  return (
    <Card
      radius="md"
      className="bg-content1 border border-outline w-full space-y-4"
    >
      <div className="font-light text-base text-foreground-1 p-4">
        Restaking leaderboard
      </div>

      <div className="text-sm">
        <div className="flex flex-row gap-x-2 justify-between items-center p-4 text-foreground-1">
          <span className="basis-full">Re-stakers</span>
          <span className="basis-1/4">Share</span>
          <span className="basis-1/3 text-end">TVL</span>
        </div>
        {mockdata.map((operator, i) => (
          <div
            key={`operator-item-${i}`}
            className={`border-t border-outline flex flex-row gap-x-2 justify-between items-center p-4 hover:bg-default`}
          >
            <div className="min-w-5">{i + 1}</div>
            <div
              className="bg-center bg-contain bg-no-repeat h-5 rounded-full min-w-5"
              style={{ backgroundImage: `url('${operator.operator.logo}')` }}
            ></div>
            <span className="basis-full truncate">
              {operator.operator.name}
            </span>
            <span className="basis-1/3">
              {formatNumber(operator.share, compact)}%
            </span>
            <span className="basis-1/3 text-end">
              <div>{formatNumber(operator.tvl.eth, compact)}ETH</div>
              <div className="text-foreground-1 text-xs">
                $ {formatNumber(operator.tvl.usd, compact)}
              </div>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
