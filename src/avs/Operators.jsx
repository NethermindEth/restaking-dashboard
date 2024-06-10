import React from 'react';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';
import { formatDate, formatNumber } from '../utils';
import { Card, Input } from '@nextui-org/react';
import { SearchIcon } from '@nextui-org/shared-icons';

const mockOperators = [
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

export default function Operators() {
  const compact = !useTailwindBreakpoint('md');
  return (
    <div className="w-full flex items-start justify-between gap-4">
      <Card
        radius="md"
        className="bg-content1 border border-outline w-full space-y-4"
      >
        <div className="flex items-center justify-between p-4 ">
          <div className="font-light text-base text-foreground-1">
            All Operators
          </div>
          <div>
            <Input
              type="text"
              placeholder="Search..."
              radius="sm"
              variant="bordered"
              startContent={<SearchIcon className="size-4" />}
            />
          </div>
        </div>

        <div className="text-sm">
          <div className="flex flex-row gap-x-2 justify-between items-center p-4 text-foreground-1">
            <span className="basis-full">Operators</span>
            <span className="basis-1/4">Share</span>
            <span className="basis-1/3 text-end">TVL</span>
          </div>
          {mockOperators.map((operator, i) => (
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
      <div className="flex flex-col gap-4 justify-between items-end w-full">
        <Card
          radius="md"
          className="bg-content1 border border-outline w-full space-y-4"
        >
          <div className="font-light text-base text-foreground-1 p-4">
            Latest aggregated operators
          </div>
          <div className="text-sm">
            <div className="flex flex-row gap-x-2 justify-between items-center p-4 text-foreground-1">
              <span className="basis-1/2">Operators</span>
              <span className="basis-1/4">Joined time</span>
              <span className="basis-1/3 text-end">TVL</span>
            </div>
            {mockOperators.slice(0, 3).map((operator, i) => (
              <div
                key={`operator-item-${i}`}
                className={`border-t border-outline flex flex-row gap-x-2 justify-between items-center p-4 hover:bg-default`}
              >
                <div className="min-w-5">{i + 1}</div>
                <div
                  className="bg-center bg-contain bg-no-repeat h-5 rounded-full min-w-5"
                  style={{
                    backgroundImage: `url('${operator.operator.logo}')`
                  }}
                ></div>
                <span className="basis-1/2 truncate">
                  {operator.operator.name}
                </span>
                <span className="basis-1/3">{formatDate(operator.joined)}</span>
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
        <Card
          radius="md"
          className="bg-content1 border border-outline w-full space-y-4"
        >
          <div className="font-light text-base text-foreground-1 p-4">
            Inactive operators
          </div>
          <div className="text-sm">
            <div className="flex flex-row gap-x-2 justify-between items-center p-4 text-foreground-1">
              <span className="basis-1/2">Operators</span>
              <span className="basis-1/4">Joined time</span>
              <span className="basis-1/3 text-end">TVL</span>
            </div>
            {mockOperators.slice(0, 3).map((operator, i) => (
              <div
                key={`operator-item-${i}`}
                className={`border-t border-outline flex flex-row gap-x-2 justify-between items-center p-4 hover:bg-default`}
              >
                <div className="min-w-5">{i + 1}</div>
                <div
                  className="bg-center bg-contain bg-no-repeat h-5 rounded-full min-w-5"
                  style={{
                    backgroundImage: `url('${operator.operator.logo}')`
                  }}
                ></div>
                <span className="basis-1/2 truncate">
                  {operator.operator.name}
                </span>
                <span className="basis-1/3">{formatDate(operator.joined)}</span>
                <span className="basis-1/3 text-end">
                  <div className="text-danger">
                    -{formatNumber(operator.tvl.eth, compact)}ETH
                  </div>
                  <div className="text-foreground-1 text-xs">
                    $ {formatNumber(operator.tvl.usd, compact)}
                  </div>
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
