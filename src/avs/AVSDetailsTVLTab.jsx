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
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import { reduceState } from '../shared/helpers';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';
import {
  BEACON_STRATEGY,
  EIGEN_STRATEGY,
  LST_STRATEGY_ASSET_MAPPING
} from './helpers';
import { formatUSD, formatETH, formatNumber } from '../shared/formatters';
import TVLTabLineChart from './charts/TVLTabLineChart';
import { ParentSize } from '@visx/responsive';
import TVLTabTreemap from './charts/TVLTabTreemap';

export default function AVSDetailsTVLTab({
  totalTokens,
  lst,
  ethRate,
  isAVSLoading
}) {
  const { address } = useParams();

  const [state, dispatch] = useMutativeReducer(reduceState, {
    points: undefined,
    isChartLoading: true
  });
  const { avsService } = useServices();

  useEffect(() => {
    (async () => {
      dispatch({ isChartLoading: true });
      const response = await avsService.getAVSTotalValue(address);
      dispatch({
        isChartLoading: false,
        points: response
      });
    })();
  }, []);

  // our endpoint only returns up to yesterdays data. We need to append today's data point
  // into the graph
  const currentPoint = useMemo(
    () => ({
      timestamp: new Date(),
      // use current eth rate as "historical" rate
      rate: ethRate,
      tvl: totalTokens.eth + totalTokens.lst
    }),
    [totalTokens]
  );

  return (
    <>
      {/* line chart */}
      {isAVSLoading || state.isChartLoading ? (
        <div className="bg-content1 border border-outline flex items-center justify-center h-[512px] mb-4 p-4 rounded-lg w-full">
          <Spinner color="primary" size="lg" />
        </div>
      ) : (
        <ParentSize className="mb-4">
          {parent => (
            <TVLTabLineChart
              height={512}
              points={state.points.concat(currentPoint)}
              width={parent.width}
            />
          )}
        </ParentSize>
      )}

      {/*layout*/}
      <div className="flex flex-col gap-4 md:flex-row w-full h-min">
        <div className="basis-1/2 w-full md:w-1/2">
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
        {isAVSLoading ? (
          <div className="basis-1/2">
            <div className="bg-content1 border border-outline flex items-center justify-center h-full min-h-[512px] p-4 rounded-lg w-full">
              <Spinner color="primary" size="lg" />
            </div>
          </div>
        ) : (
          <>
            <div className="basis-1/2 w-full md:w-1/2">
              <ParentSize className="h-full">
                {parent => (
                  <TVLTabTreemap
                    // the extra 88 is from 1px top/bottom border , 16px top/bottomp padding
                    // 38px title and control, 16px margin bottom for title
                    // otherwise we will have an infinitely growing SVG because there is no fixed height
                    height={(parent.height || 512) - 2 - 32 - 38 - 16}
                    // 1px left/right border, 16px left/right padding
                    width={parent.width - 2 - 32}
                    lst={lst}
                    ethRate={ethRate}
                  />
                )}
              </ParentSize>
            </div>
          </>
        )}
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
                    src={LST_STRATEGY_ASSET_MAPPING[key].logo}
                    fallbackSrc="/eth.png"
                  />
                  <span className="text-foreground-2 truncate">
                    {LST_STRATEGY_ASSET_MAPPING[key]?.name}
                  </span>{' '}
                  <span className="text-foreground-1">
                    {LST_STRATEGY_ASSET_MAPPING[key]?.symbol}
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
          onPointerDown={() => setIsOpen(!isOpen)}
        >
          info
        </span>
      </Tooltip>
    </div>
  );
}
