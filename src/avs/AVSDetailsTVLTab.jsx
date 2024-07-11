import {
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Image,
  Skeleton,
  Spacer,
  Tooltip
} from '@nextui-org/react';
import React, { useMemo, useState } from 'react';
import {
  BEACON_STRATEGY,
  EIGEN_STRATEGY,
  STRATEGY_ASSET_MAPPING
} from './helpers';
import { formatNumber } from '../utils';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';

export default function AVSDetailsTVLTab({
  totalTokens,
  lst,
  ethRate,
  isAVSLoading
}) {
  return (
    <>
      {/*line chart*/}
      <div className="bg-content1 border border-outline flex items-center justify-center h-[512px] p-4 rounded-lg w-full">
        <Spinner color="primary" size="lg" />
      </div>

      {/*layout*/}
      <div className="flex flex-col md:flex-row w-full h-full">
        <div className="basis-1/2 mt-4">
          <TokensBreakdownList
            totalTokens={totalTokens}
            isAVSLoading={isAVSLoading}
            ethRate={ethRate}
          />
          <Spacer y={4} />
          <LSTBreakdownList
            lst={lst}
            isAVSLoading={isAVSLoading}
            ethRate={ethRate}
          />
        </div>
        {/* treemap */}
        <div className="basis-1/2 mt-4 md:ml-4">
          <div className="bg-content1 border border-outline flex items-center justify-center h-full min-h-[512px] p-4 rounded-lg w-full">
            <Spinner color="primary" size="lg" />
          </div>
        </div>
      </div>
    </>
  );
}

const tokens = {
  eth: {
    name: 'Beacon',
    symbol: 'ETH',
    logo: '/eth.png'
  },
  lst: {
    name: 'Liquid Staking Tokens',
    logo: '/eth.png'
  },
  eigen: {
    name: 'Eigen',
    symbol: 'EIGEN',
    logo: '/eigen.webp'
  }
};

function TokensBreakdownList({ totalTokens, isAVSLoading, ethRate }) {
  const sortedTotalTokens = useMemo(() => {
    const arr = Object.entries(totalTokens);
    arr.sort((a, b) => b[1] - a[1]);
    return arr;
  }, [totalTokens]);

  const sum = useMemo(
    () => sortedTotalTokens.reduce((acc, [_, total]) => acc + total, 0),
    [sortedTotalTokens]
  );

  const compact = !useTailwindBreakpoint('md');

  return (
    <Table
      aria-label="Breakdown of ETH, EIGEN and Liquid Staking Tokens"
      layout="fixed"
      hideHeader
      classNames={{
        wrapper: 'border border-outline rounded-lg',
        tr: 'border-b border-outline last:border-none'
      }}
      topContent={
        <div className="text-foreground-1 text-medium">Tokens distribution</div>
      }
    >
      <TableHeader>
        <TableColumn className="w-1/2">Token</TableColumn>
        <TableColumn>Total</TableColumn>
      </TableHeader>
      <TableBody>
        {isAVSLoading &&
          [...new Array(3)].map((_, i) => (
            <TableRow key={i}>
              <TableCell className="pl-0">
                <Skeleton className="h-5 w-full rounded-md" />
              </TableCell>
              <TableCell className="flex justify-end">
                <Skeleton className="h-10 w-20 rounded-md" />
              </TableCell>
            </TableRow>
          ))}
        {!isAVSLoading &&
          sortedTotalTokens.map(([key, total]) => (
            <TableRow key={key}>
              <TableCell className="text-sm pl-0">
                <div className="flex truncate gap-x-2 items-center">
                  <Image height={16} width={16} src={tokens[key].logo} />
                  <span className="text-foreground-2 truncate">
                    {tokens[key].name}
                  </span>{' '}
                  <span className="text-foreground-1">
                    {tokens[key].symbol}
                  </span>
                  <span className="text-foreground-1">
                    {((total / sum) * 100).toFixed(2)}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="flex justify-end">
                <div className="text-end">
                  {key === 'eigen' ? (
                    <EigenDisclaimer />
                  ) : (
                    <div>${formatNumber(total * ethRate, compact)}</div>
                  )}

                  <div className="text-sm text-subtitle">
                    {formatNumber(total, compact)} tokens
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}

function LSTBreakdownList({ lst, ethRate, isAVSLoading }) {
  const sortedTokens = useMemo(() => {
    if (isAVSLoading) {
      return [];
    }

    const exclude = new Set([EIGEN_STRATEGY, BEACON_STRATEGY]);

    const arr = Object.entries(lst);
    arr.sort((a, b) => Number(b[1]) - Number(a[1]));
    return arr.filter(([strategy]) => !exclude.has(strategy));
  }, [lst, isAVSLoading]);

  const compact = !useTailwindBreakpoint('md');

  return (
    <Table
      aria-label="Breakdown of Liquid Staking Tokens"
      hideHeader
      layout="fixed"
      classNames={{
        wrapper: 'border border-outline rounded-lg',
        tr: 'border-b border-outline last:border-none'
      }}
      topContent={
        <div className="text-foreground-1 text-medium">LST distribution</div>
      }
    >
      <TableHeader>
        <TableColumn className="w-1/2">LST</TableColumn>
        <TableColumn>ETH</TableColumn>
      </TableHeader>
      <TableBody>
        {isAVSLoading &&
          [...new Array(12)].map((_, i) => (
            <TableRow key={i}>
              <TableCell className="pl-0">
                <Skeleton className="h-5 w-full rounded-md" />
              </TableCell>
              <TableCell className="flex justify-end">
                <Skeleton className="h-10 w-20 rounded-md" />
              </TableCell>
            </TableRow>
          ))}
        {!isAVSLoading &&
          sortedTokens.map(([key, total]) => (
            <TableRow key={key}>
              <TableCell className="text-sm pl-0">
                <div className="flex items-center gap-x-2">
                  <Image
                    height={16}
                    width={16}
                    src={STRATEGY_ASSET_MAPPING[key].logo}
                    fallbackSrc="/eth.png"
                  />
                  <span className="text-foreground-2 truncate">
                    {STRATEGY_ASSET_MAPPING[key]?.name}
                  </span>{' '}
                  <span className="text-foreground-1">
                    {STRATEGY_ASSET_MAPPING[key]?.symbol}
                  </span>
                </div>
              </TableCell>
              <TableCell className="flex justify-end">
                <div className="text-end">
                  <div>${formatNumber(Number(total) * ethRate, compact)}</div>

                  <div className="text-sm text-subtitle">
                    {formatNumber(Number(total), compact)} ETH
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}

function EigenDisclaimer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="inline-flex gap-x-1 items-center">
      N/A
      <Tooltip
        showArrow={true}
        placement="top"
        content={
          <div className="max-w-[250px] p-4 break-words">
            <div className="text-sm">
              EIGEN is currently not listed on any exchanges so we are unable to
              get its USD value. Information will be updated when the token is
              available on centralized/decentralized exchanges.
            </div>
          </div>
        }
        isOpen={isOpen}
      >
        <span
          className="text-sm material-symbols-outlined cursor-pointer"
          style={{
            fontVariationSettings: `'FILL' 0`
          }}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          // to make tooltip work on mobile
          onPress={() => setIsOpen(!isOpen)}
        >
          info
        </span>
      </Tooltip>
    </div>
  );
}
