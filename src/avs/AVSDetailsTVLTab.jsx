import {
  BEACON_STRATEGY,
  EIGEN_STRATEGY,
  STRATEGY_ASSET_MAPPING
} from './helpers';
import { formatETH, formatNumber, formatUSD } from '../shared/formatters';
import {
  Image,
  Skeleton,
  Spacer,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip
} from '@nextui-org/react';
import { useMemo, useState } from 'react';
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
            ethRate={ethRate}
            isAVSLoading={isAVSLoading}
            totalTokens={totalTokens}
          />
          <Spacer y={4} />
          <LSTBreakdownList
            ethRate={ethRate}
            isAVSLoading={isAVSLoading}
            lst={lst}
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
    symbol: 'ETH',
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
    // eslint-disable-next-line no-unused-vars
    () => sortedTotalTokens.reduce((acc, [_, total]) => acc + total, 0),
    [sortedTotalTokens]
  );

  const compact = !useTailwindBreakpoint('md');

  return (
    <Table
      aria-label="Breakdown of ETH, EIGEN and Liquid Staking Tokens"
      classNames={{
        wrapper: 'border border-outline rounded-lg',
        tr: 'border-b border-outline last:border-none'
      }}
      hideHeader
      layout="fixed"
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
                  <Image height={16} src={tokens[key].logo} width={16} />
                  <span className="text-foreground-2 truncate">
                    {tokens[key].name}
                  </span>{' '}
                  <span className="text-foreground-1">
                    {key !== 'lst' && tokens[key].symbol}
                  </span>
                  <span className="text-foreground-1">
                    {((total / sum) * 100).toFixed(2)}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm flex justify-end">
                <div className="text-end">
                  {key === 'eigen' ? (
                    <EigenDisclaimer />
                  ) : (
                    <div>{formatUSD(total * ethRate, compact)}</div>
                  )}

                  <div className="text-xs text-foreground-2">
                    {formatNumber(total, compact)} {tokens[key].symbol}
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
      classNames={{
        wrapper: 'border border-outline rounded-lg',
        tr: 'border-b border-outline last:border-none'
      }}
      hideHeader
      layout="fixed"
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
                    fallbackSrc="/eth.png"
                    height={16}
                    src={STRATEGY_ASSET_MAPPING[key].logo}
                    width={16}
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
                  <div>{formatUSD(Number(total) * ethRate, compact)}</div>

                  <div className="text-xs text-foreground-2">
                    {formatETH(Number(total), compact)}
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
        placement="top"
        showArrow={true}
      >
        <span
          className="text-sm material-symbols-outlined cursor-pointer"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          // to make tooltip work on mobile
          onPointerDown={() => setIsOpen(!isOpen)}
          style={{
            fontVariationSettings: `'FILL' 0`
          }}
        >
          info
        </span>
      </Tooltip>
    </div>
  );
}
