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
      className="w-full space-y-4 border border-outline bg-content1"
    >
      <div className="p-4 text-base font-light text-foreground-1">
        Restaking leaderboard
      </div>

      <div className="text-sm">
        <div className="flex flex-row items-center justify-between gap-x-2 p-4 text-foreground-1">
          <span className="basis-full">Re-stakers</span>
          <span className="basis-1/4">Share</span>
          <span className="basis-1/3 text-end">TVL</span>
        </div>
        {mockdata.map((operator, i) => (
          <div
            key={`operator-item-${i}`}
            className={`flex flex-row items-center justify-between gap-x-2 border-t border-outline p-4 hover:bg-default`}
          >
            <div className="min-w-5">{i + 1}</div>
            <img src={operator.operator.logo} className="size-5 rounded-full" />
            <span className="basis-full truncate">
              {operator.operator.name}
            </span>
            <span className="basis-1/3">
              {formatNumber(operator.share, compact)}%
            </span>
            <span className="basis-1/3 text-end">
              <div>{formatNumber(operator.tvl.eth, compact)}ETH</div>
              <div className="text-xs text-foreground-1">
                $ {formatNumber(operator.tvl.usd, compact)}
              </div>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
