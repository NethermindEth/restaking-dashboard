import {
  BEACON_STRATEGY,
  EIGEN_STRATEGY,
  lstStrategyAssetMapping
} from '../shared/strategies';
import { formatETH, formatNumber, formatUSD } from '../shared/formatters';
import {
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
import { useEffect, useMemo, useState } from 'react';
import { ParentSize } from '@visx/responsive';
import { reduceState } from '../shared/helpers';
import ThirdPartyLogo from '../shared/ThirdPartyLogo';
import { tooltip } from '../shared/slots';
import TVLTabLineChart from './charts/TVLTabLineChart';
import TVLTabTreemap from './charts/TVLTabTreemap';
import { useMutativeReducer } from 'use-mutative';
import { useParams } from 'react-router-dom';
import { useServices } from '../@services/ServiceContext';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';

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
  }, [address, avsService, dispatch]);

  // our endpoint only returns up to yesterdays data. We need to append today's data point
  // into the graph
  const currentPoint = useMemo(
    () => ({
      timestamp: new Date(),
      // use current eth rate as "historical" rate
      rate: ethRate,
      tvl: totalTokens.eth + totalTokens.lst
    }),
    [ethRate, totalTokens]
  );

  return (
    <>
      {/* line chart */}
      {isAVSLoading || state.isChartLoading ? (
        <div className="mb-4 flex h-[390px] w-full items-center justify-center rounded-lg border border-outline bg-content1 p-4">
          <Spinner color="primary" size="lg" />
        </div>
      ) : (
        <ParentSize className="mb-4">
          {parent => (
            <TVLTabLineChart
              height={288}
              points={state.points.concat(currentPoint)}
              width={parent.width}
            />
          )}
        </ParentSize>
      )}

      {/*layout*/}
      <div className="flex h-min w-full flex-col gap-4 md:flex-row">
        <div className="w-full basis-1/2 md:w-1/2">
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
        {isAVSLoading ? (
          <div className="basis-1/2">
            <div className="flex h-full min-h-[512px] w-full items-center justify-center rounded-lg border border-outline bg-content1 p-4">
              <Spinner color="primary" size="lg" />
            </div>
          </div>
        ) : (
          <>
            <div className="w-full basis-1/2 md:w-1/2">
              <ParentSize className="h-full">
                {parent => (
                  <TVLTabTreemap
                    ethRate={ethRate}
                    // the extra 88 is from 1px top/bottom border , 16px top/bottomp padding
                    // 38px title and control, 16px margin bottom for title
                    // otherwise we will have an infinitely growing SVG because there is no fixed height
                    height={(parent.height || 512) - 2 - 32 - 38 - 16}
                    lst={lst}
                    // 1px left/right border, 16px left/right padding
                    width={parent.width - 2 - 32}
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
    logo: '/images/eth.png'
  },
  lst: {
    name: 'Liquid Staking Tokens',
    symbol: 'ETH',
    logo: '/images/eth-multicolor.png'
  },
  eigen: {
    name: 'Eigen',
    symbol: 'EIGEN',
    logo: '/images/eigen.png'
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
        wrapper: 'rounded-lg border border-outline',
        tr: 'border-b border-outline last:border-none'
      }}
      hideHeader
      layout="fixed"
      topContent={
        <div className="text-medium text-foreground-1">Tokens distribution</div>
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
              <TableCell className="pl-0 text-sm">
                <div className="flex items-center gap-x-2 truncate">
                  <ThirdPartyLogo
                    className="size-5 min-w-5"
                    url={tokens[key].logo}
                  />
                  <span className="truncate text-foreground-2">
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
              <TableCell className="flex justify-end text-sm">
                <div className="text-end">
                  {key === 'eigen' ? (
                    <EigenDisclaimer />
                  ) : (
                    <div>{formatUSD(total * ethRate, compact)}</div>
                  )}

                  <div className="text-xs text-foreground-2">
                    {key !== 'eigen'
                      ? formatETH(total, compact)
                      : `EIGEN ${formatNumber(total, compact)}`}
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
        wrapper: 'rounded-lg border border-outline',
        tr: 'border-b border-outline last:border-none'
      }}
      hideHeader
      layout="fixed"
      topContent={
        <div className="text-medium text-foreground-1">LST distribution</div>
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
              <TableCell className="pl-0 text-sm">
                <div className="flex items-center gap-x-2">
                  <ThirdPartyLogo
                    className="size-5 min-w-5"
                    url={lstStrategyAssetMapping[key].logo}
                  />
                  <span className="truncate text-foreground-2">
                    {lstStrategyAssetMapping[key]?.name}
                  </span>{' '}
                  <span className="text-foreground-1">
                    {lstStrategyAssetMapping[key]?.symbol}
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
  const [isOpen, setOpen] = useState(false);

  return (
    <div className="inline-flex items-center gap-x-1">
      N/A
      <Tooltip
        classNames={tooltip}
        content={
          <>
            EIGEN is currently not listed on any exchanges so we are unable to
            get its USD value. Information will be updated when the token is
            available on centralized/decentralized exchanges.
          </>
        }
        isOpen={isOpen}
        onOpenChange={open => setOpen(open)}
        placement="top"
        showArrow={true}
      >
        <span
          className="material-symbols-outlined cursor-pointer text-sm"
          onPointerDown={() => setOpen(!isOpen)}
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
