import {
  BEACON_STRATEGY,
  EIGEN_STRATEGY,
  lstStrategyAssetMapping
} from '../shared/strategies';
import { formatETH, formatNumber, formatUSD } from '../shared/formatters';
import { handleServiceError, reduceState } from '../shared/helpers';
import {
  Link,
  Skeleton,
  Spinner,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
  Tooltip
} from '@nextui-org/react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CopyButton from '../shared/CopyButton';
import ErrorMessage from '../shared/ErrorMessage';
import { formatEther } from 'ethers';
import OperatorRestakersLineChart from './charts/OperatorRestakersLineChart';
import OperatorTVLLineChart from './charts/OperatorTVLLineChart';
import { ParentSize } from '@visx/responsive';
import ThirdPartyLogo from '../shared/ThirdPartyLogo';
import { tooltip } from '../shared/slots';
import { truncateAddress } from '../shared/helpers';
import TVLTabTreemap from '../avs/charts/TVLTabTreemap';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import { useTailwindBreakpoint } from '../shared/hooks/useTailwindBreakpoint';

export default function OperatorDetails() {
  const { address, tab } = useParams();
  const { pathname } = useLocation();

  const [state, dispatch] = useMutativeReducer(reduceState, {
    error: undefined,
    ethRate: undefined,
    operator: undefined,
    isOperatorLoading: true,
    strategies: undefined,
    tvl: undefined,
    totalTokens: {
      lst: 0,
      eth: 0,
      eigen: 0
    }
  });
  const { operatorService } = useServices();
  const compact = !useTailwindBreakpoint('lg');

  useEffect(() => {
    dispatch({ isOperatorLoading: true, error: undefined });

    (async () => {
      try {
        const operator = await operatorService.getOperator(address);

        const totals = { lst: 0n, eth: 0n, eigen: 0n };
        const strategies = Object.create(null);

        const tvl = operator.strategies?.reduce((acc, s) => {
          if (s.address === EIGEN_STRATEGY) {
            totals.eigen += BigInt(s.tokens);
            return acc;
          } else if (s.address === BEACON_STRATEGY) {
            totals.eth += BigInt(s.tokens);
          } else {
            totals.lst += BigInt(s.tokens);
          }
          strategies[s.address] = Number(formatEther(s.tokens));
          return (acc += BigInt(s.tokens));
        }, 0n);

        totals.eigen = Number(formatEther(totals.eigen));
        totals.eth = Number(formatEther(totals.eth));
        totals.lst = Number(formatEther(totals.lst));

        dispatch({
          operator,
          tvl: parseFloat(tvl ?? 0) / 1e18,
          ethRate: operator.rate,
          isOperatorLoading: false,
          strategies,
          totalTokens: totals
        });
      } catch (e) {
        dispatch({
          isOperatorLoading: false,
          error: handleServiceError(e)
        });
      }
    })();
  }, [address, dispatch, operatorService]);

  return (
    <>
      {state.isOperatorLoading && (
        <div className="rd-box min-h-[180px] w-full p-4">
          <div className="flex max-w-[300px] items-center">
            <Skeleton className="size-12 shrink-0 rounded-full border border-outline" />
            <Skeleton className="ml-2 h-8 w-full rounded-md" />
          </div>
          <div className="my-4">
            <Skeleton className="h-16 w-full rounded-md" />
          </div>
        </div>
      )}

      {state.error && (
        <div className="rd-box flex min-h-[180px] w-full items-center justify-center p-4">
          <ErrorMessage error={state.error} />
        </div>
      )}

      {!state.isOperatorLoading && !state.error && (
        <>
          <div className="rd-box flex w-full flex-row flex-wrap items-center gap-x-5 gap-y-2 break-words p-4">
            <div className="flex basis-full items-center gap-4">
              <ThirdPartyLogo
                className="size-12 min-w-12"
                url={state.operator.metadata?.logo}
              />
              <span className="font-display text-3xl font-medium text-foreground-1">
                {state.operator.metadata?.name ??
                  truncateAddress(state.operator.address)}
                {/*TODO: implement ranking when coming from list view & accessing directly operator*/}
                {/* <span className="ml-2 inline-block translate-y-[-25%] rounded-md bg-foreground-2 p-1 text-xs text-content1"> */}
                {/*   # 1 */}
                {/* </span> */}
              </span>
            </div>
            <span className="basis-full break-words pt-4 text-xs text-foreground-1">
              {state.operator.metadata?.description}
            </span>
            <div className="flex basis-full items-center gap-1 lg:basis-0">
              <Link
                className="truncate text-xs text-secondary"
                href={`https://etherscan.io/address/${state.operator.address}`}
                rel="noreferrer"
                target="_blank"
              >
                {state.operator.address}
              </Link>
              <CopyButton color="secondary" value={state.operator.address} />
            </div>
            {state.operator.metadata?.website && (
              <Link
                className="me-2 flex basis-0 items-center text-secondary"
                href={state.operator.metadata.website}
                rel="noreferrer"
                size="sm"
                target="_blank"
              >
                <span className="material-symbols-outlined me-1 text-xl text-secondary">
                  language
                </span>
                Website
              </Link>
            )}
            {state.operator.metadata?.twitter && (
              <Link
                className="basis-0 border-none text-secondary"
                href={state.operator.metadata.twitter}
                rel="noreferrer"
                size="sm"
                target="_blank"
              >
                <span
                  className="me-1 h-4 w-4 bg-secondary"
                  style={{
                    mask: 'url(/images/x.svg) no-repeat',
                    backgroundColor: 'hsl(var(--app-secondary))'
                  }}
                ></span>
                @
                {state.operator.metadata.twitter.substring(
                  state.operator.metadata.twitter.lastIndexOf('/') + 1
                )}
              </Link>
            )}
          </div>
        </>
      )}

      <Tabs
        className="my-4 w-full"
        classNames={{
          cursor: 'rounded border border-outline shadow-none',
          panel: 'p-0',
          tab: 'h-fit p-2',
          tabList: 'rd-box w-full !overflow-x-scroll p-2'
        }}
        radius="sm"
        selectedKey={tab ? pathname : `${pathname}/tvl`}
        size="lg"
      >
        <Tab
          href={`/operators/${address}/tvl`}
          key={`/operators/${address}/tvl`}
          title={
            <div className="flex flex-col items-center">
              <div className="text-sm text-foreground-2 group-aria-selected:text-foreground-1">
                TVL
              </div>
              <div className="flex w-full justify-center">
                {state.isOperatorLoading && (
                  <Skeleton className="mt-2 h-4 w-full min-w-16 rounded-md" />
                )}

                {state.error && <ErrorMessage error={state.error} />}

                {!state.isOperatorLoading && !state.error && (
                  <span className="text-foreground-1 group-aria-selected:text-foreground">
                    {formatETH(state.tvl, compact)}
                  </span>
                )}
              </div>
            </div>
          }
        >
          <OperatorTVLLineChart
            currentTVL={state.tvl}
            ethRate={state.ethRate}
            isOperatorLoading={state.isOperatorLoading}
            operatorError={state.error}
          />
          <div className="flex h-min w-full flex-col gap-4 md:flex-row">
            <div className="flex w-full basis-1/2 flex-col gap-y-4 md:w-1/2">
              <TokensBreakdownList
                ethRate={state.ethRate}
                isOperatorLoading={state.isOperatorLoading}
                operatorError={state.error}
                totalTokens={state.totalTokens}
              />
              <LSTBreakdownList
                ethRate={state.ethRate}
                isOperatorLoading={state.isOperatorLoading}
                lst={state.strategies}
                operatorError={state.error}
              />
            </div>
            {(state.isOperatorLoading || state.error) && (
              <div className="basis-1/2">
                <div className="rd-box flex h-full min-h-[512px] w-full items-center justify-center p-4">
                  {state.isOperatorLoading && (
                    <Spinner color="primary" size="lg" />
                  )}
                  {state.error && <ErrorMessage error={state.error} />}
                </div>
              </div>
            )}

            {!state.isOperatorLoading && !state.error && (
              <>
                {' '}
                <div className="w-full basis-1/2 md:w-1/2">
                  <ParentSize className="h-full">
                    {parent => (
                      <TVLTabTreemap
                        ethRate={state.ethRate}
                        // the extra 88 is from 1px top/bottom border , 16px top/bottomp padding
                        // 38px title and control, 16px margin bottom for title
                        // otherwise we will have an infinitely growing SVG because there is no fixed height
                        height={(parent.height || 512) - 2 - 32 - 38 - 16}
                        lst={state.strategies}
                        // 1px left/right border, 16px left/right padding
                        width={parent.width - 2 - 32}
                      />
                    )}
                  </ParentSize>
                </div>
              </>
            )}
          </div>
        </Tab>

        <Tab
          href={`/operators/${address}/avs`}
          key={`/operators/${address}/avs`}
          title={
            <div className="flex flex-col items-center">
              <div className="text-sm text-foreground-2 group-aria-selected:text-foreground-1">
                AVS secured
              </div>
              <div className="flex w-full justify-center">
                {state.isOperatorLoading && (
                  <Skeleton className="mt-2 h-4 w-full min-w-16 rounded-md" />
                )}

                {state.error && <ErrorMessage error={state.error} />}

                {!state.isOperatorLoading && !state.error && (
                  <span className="text-foreground-1 group-aria-selected:text-foreground">
                    {state.operator?.avs?.length}
                  </span>
                )}
              </div>
            </div>
          }
        >
          <AVSList
            error={state.error}
            isLoading={state.isOperatorLoading}
            list={state.operator?.avs}
          />
        </Tab>

        <Tab
          href={`/operators/${address}/restakers`}
          key={`/operators/${address}/restakers`}
          title={
            <div className="flex flex-col items-center">
              <div className="text-sm">Restakers</div>
              <div className="flex w-full justify-center">
                {state.isOperatorLoading && (
                  <Skeleton className="mt-2 h-4 w-full min-w-16 rounded-md" />
                )}

                {state.error && <ErrorMessage error={state.error} />}

                {!state.isOperatorLoading && !state.error && (
                  <span>{state.operator?.stakerCount}</span>
                )}
              </div>
            </div>
          }
        >
          <OperatorRestakersLineChart
            isOperatorLoading={state.isOperatorLoading}
            operatorError={state.error}
            restakers={state.operator?.stakerCount}
          />
        </Tab>
      </Tabs>
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

function TokensBreakdownList({
  operatorError,
  totalTokens,
  isOperatorLoading,
  ethRate
}) {
  const sortedTotalTokens = useMemo(() => {
    const arr = Object.entries(totalTokens).filter(t => t[0] !== 'eigen');
    arr.sort((a, b) => b[1] - a[1]);
    return arr;
  }, [totalTokens]);

  const sum = useMemo(
    // eslint-disable-next-line no-unused-vars
    () => sortedTotalTokens.reduce((acc, [_, total]) => acc + total, 0),
    [sortedTotalTokens]
  );

  const compact = !useTailwindBreakpoint('md');

  if (operatorError) {
    return (
      <div className="rd-box flex w-full flex-1 flex-col items-center justify-center">
        <ErrorMessage error={operatorError} />
      </div>
    );
  }

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
        {isOperatorLoading &&
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
        {!isOperatorLoading &&
          sortedTotalTokens.map(([key, total]) => (
            <TableRow key={key}>
              <TableCell className="pl-0 text-sm">
                <div className="flex items-center gap-x-2 truncate">
                  <ThirdPartyLogo
                    className="size-6 min-w-6"
                    url={tokens[key].logo}
                  />
                  <span className="truncate text-foreground-2">
                    {tokens[key].name}
                  </span>
                  {sum > 0 && (
                    <span className="text-foreground-1">
                      {`${((total / sum) * 100).toFixed(2)}%`}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="flex justify-end text-sm">
                <div className="text-end">
                  <div>{formatUSD(total * ethRate, compact)}</div>

                  <div className="text-xs text-foreground-2">
                    {formatETH(total, compact)}
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        {!isOperatorLoading && (
          <TableRow>
            <TableCell className="pl-0 text-sm">
              <div className="flex items-center gap-x-2 truncate">
                <ThirdPartyLogo
                  className="size-6 min-w-6"
                  url={tokens['eigen'].logo}
                />
                <span className="truncate text-foreground-2">
                  {tokens['eigen'].name}
                </span>
                <span className="text-foreground-1">
                  {tokens['eigen'].symbol}
                </span>
                {<span className="text-foreground-1">N/A</span>}
              </div>
            </TableCell>
            <TableCell className="flex justify-end text-sm">
              <div className="text-end">
                <EigenDisclaimer />
                <div className="text-xs text-foreground-2">
                  {`${formatNumber(totalTokens['eigen'], compact)} EIGEN`}
                </div>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function LSTBreakdownList({ operatorError, lst, ethRate, isOperatorLoading }) {
  const sortedTokens = useMemo(() => {
    if (isOperatorLoading || operatorError) {
      return [];
    }

    const exclude = new Set([EIGEN_STRATEGY, BEACON_STRATEGY]);

    const arr = Object.entries(lst);
    arr.sort((a, b) => Number(b[1]) - Number(a[1]));
    return arr.filter(([strategy]) => !exclude.has(strategy));
  }, [operatorError, lst, isOperatorLoading]);

  const compact = !useTailwindBreakpoint('md');

  if (operatorError) {
    return (
      <div className="rd-box flex w-full flex-1 flex-col items-center justify-center">
        <ErrorMessage error={operatorError} />
      </div>
    );
  }

  if (!isOperatorLoading && sortedTokens.length === 0) {
    return (
      <div className="rd-box flex min-h-40 w-full flex-1 flex-col items-center justify-center">
        <span className="text-lg text-foreground-2">
          No strategies to display
        </span>
      </div>
    );
  }

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
        {isOperatorLoading &&
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
        {!isOperatorLoading &&
          sortedTokens.map(([key, total]) => (
            <TableRow key={key}>
              <TableCell className="pl-0 text-sm">
                <div className="flex items-center gap-x-2">
                  <ThirdPartyLogo
                    className="size-6 min-w-6"
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

function AVSList({ list, error, isLoading }) {
  const navigate = useNavigate();

  if (error) {
    return (
      <div className="rd-box flex h-[390px] w-full flex-1 flex-col items-center justify-center">
        <ErrorMessage error={error} />
      </div>
    );
  }

  return (
    <div className="rd-box text-sm">
      <div className="flex flex-col justify-between gap-y-4 p-4 lg:flex-row lg:items-center">
        <div className="text-medium text-foreground-1">All AVS</div>
      </div>

      <Table
        aria-label="List of AVS secured by operator"
        classNames={{
          base: 'h-full overflow-x-auto',
          table: 'h-full'
        }}
        hideHeader
        layout="fixed"
        removeWrapper
      >
        <TableHeader>
          <TableColumn className="text-foreground-active bg-transparent py-4 text-sm font-normal leading-5 data-[hover=true]:text-foreground-2 md:w-1/3">
            AVS
          </TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={
            <div className="flex flex-col items-center justify-center">
              <span className="text-lg text-foreground-2">
                No AVS is currently being secured
              </span>
            </div>
          }
        >
          {isLoading &&
            [...new Array(10)].map((_, i) => (
              <TableRow className="border-t border-outline" key={i}>
                <TableCell className="w-full p-4">
                  <Skeleton className="h-4 rounded-md" />
                </TableCell>
              </TableRow>
            ))}

          {!isLoading &&
            list.map(avs => (
              <TableRow
                className="cursor-pointer border-t border-outline transition-colors hover:bg-default"
                key={avs.address}
                onClick={() => navigate(`/avs/${avs.address}`)}
              >
                <TableCell className="p-4">
                  <div className="flex items-center gap-x-3">
                    <ThirdPartyLogo
                      className="size-8 min-w-8"
                      url={avs.metadata?.logo}
                    />
                    <span className="truncate">
                      {avs.metadata?.name || avs.address}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
