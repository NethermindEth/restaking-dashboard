import {
  allStrategyAssetMapping,
  BEACON_STRATEGY,
  EIGEN_STRATEGY
} from '../shared/strategies';
import { handleServiceError, reduceState } from '../shared/helpers';
import {
  Link,
  Progress,
  Skeleton,
  Spinner,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs
} from '@nextui-org/react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CopyButton from '../shared/CopyButton';
import ErrorMessage from '../shared/ErrorMessage';
import { formatETH } from '../shared/formatters';
import OperatorLSTPieChart from './charts/OperatorLSTPieChart';
import OperatorRestakersLineChart from './charts/OperatorRestakersLineChart';
import OperatorTVLLineChart from './charts/OperatorTVLLineChart';
import { ParentSize } from '@visx/responsive';
import ThirdPartyLogo from '../shared/ThirdPartyLogo';
import { truncateAddress } from '../shared/helpers';
import { useEffect } from 'react';
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
    tvl: undefined
  });
  const { operatorService } = useServices();
  const compact = !useTailwindBreakpoint('lg');

  useEffect(() => {
    dispatch({ isOperatorLoading: true, error: undefined });

    (async () => {
      try {
        const operator = await operatorService.getOperator(address);

        const tvl = operator.strategies?.reduce((acc, s) => {
          if (s.address === EIGEN_STRATEGY) {
            return acc;
          }
          return (acc += BigInt(s.tokens));
        }, 0n);

        dispatch({
          operator,
          tvl: parseFloat(tvl ?? 0) / 1e18,
          ethRate: operator.rate,
          isOperatorLoading: false
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
        selectedKey={tab ? pathname : pathname + '/tvl'}
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
                  <Skeleton className="mt-2 h-4 w-full rounded-md" />
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
          <LSTDistribution
            ethRate={state.ethRate}
            isOperatorLoading={state.isOperatorLoading}
            strategies={state.operator?.strategies}
            tvl={state.tvl}
          />
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
                  <Skeleton className="mt-2 h-4 w-full rounded-md" />
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
          <SecuredAVSList
            avsError={state.error}
            avsList={state.operator?.avs}
            isOperatorLoading={state.isOperatorLoading}
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
                  <Skeleton className="mt-2 h-4 w-full rounded-md" />
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

function LSTDistribution({ ethRate, isOperatorLoading, strategies, tvl }) {
  const [state, dispatch] = useMutativeReducer(reduceState, {
    lstTVL: 1,
    lstDistribution: []
  });

  useEffect(() => {
    if (!strategies) {
      return;
    }

    const filteredStrategies = [];
    let excludeBeaconTVL = 0;
    let totals = 0n;

    for (const s of strategies) {
      if (s.address !== EIGEN_STRATEGY && s.address !== BEACON_STRATEGY) {
        filteredStrategies.push(s);
      }

      if (s.address === BEACON_STRATEGY) {
        excludeBeaconTVL = parseFloat(s.tokens) / 1e18;
      }

      totals += BigInt(s.tokens);
    }

    // http://localhost:5173/operators/0x2514f445135d5e51bba6c33dd7f1898f070b8c62
    // edge case where the operators used to have some stake in strategies, but now all of them are zero
    // this will cause the pie chart to be empty so we should just display unavailable data
    if (totals === 0n) {
      return;
    }

    filteredStrategies.sort((a, b) => {
      const tokensDiff = BigInt(b.tokens) - BigInt(a.tokens);
      return parseFloat(tokensDiff);
    });

    const lstDistribution = filteredStrategies.slice(0, 6);

    if (filteredStrategies.length > 7) {
      const others = filteredStrategies.slice(6).reduce(
        (acc, current) => {
          acc.tokens += BigInt(current.tokens);
          acc.shares += BigInt(current.shares);

          return acc;
        },
        { tokens: BigInt(0), shares: BigInt(0) }
      );

      lstDistribution.push(others);
    }

    for (let i = 0; i < lstDistribution.length; i++) {
      const lst = lstDistribution[i];

      if (lst.address) {
        const mapping = allStrategyAssetMapping[lst.address];

        lst.logo = mapping.logo;
        lst.name = mapping.name;
        lst.symbol = mapping.symbol;
      } else {
        lst.logo = '/images/eth-multicolor.png';
        lst.name = 'Others';
        lst.symbol = ''; // needed as chart key
      }

      lst.tokensInETH = parseFloat(lst.tokens) / 1e18;
    }

    dispatch({
      lstTVL: tvl - excludeBeaconTVL,
      lstDistribution
    });
  }, [dispatch, strategies, tvl]);

  if (isOperatorLoading) {
    return (
      <div className="rd-box flex h-[410px] w-full items-center justify-center p-4 lg:h-[410px]">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  if (state.lstDistribution.length === 0) {
    return (
      <div className="rd-box flex h-[410px] items-center justify-center p-4">
        <div>
          <ErrorMessage message="No strategies available" />
        </div>
      </div>
    );
  }
  return (
    <div className="rd-box flex flex-col gap-7 p-4">
      <div className="text-foreground-1">LST distribution</div>
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
        <div className="flex w-full basis-3/4 flex-col gap-y-4">
          {state.lstDistribution.map((strategy, i) => {
            return (
              <LSTShare
                key={`lst-distribution-item-${i}`}
                label={strategy.name}
                logo={strategy.logo}
                symbol={strategy.symbol}
                value={(strategy.tokensInETH / state.lstTVL) * 100}
              />
            );
          })}
        </div>
        <div className="w-full basis-1/4">
          <ParentSize>
            {parent => (
              <OperatorLSTPieChart
                ethRate={ethRate}
                lstDistribution={state.lstDistribution}
                lstTVL={state.lstTVL}
                parent={parent}
              />
            )}
          </ParentSize>
        </div>
      </div>
    </div>
  );
}

function LSTShare({ label, logo, symbol, value }) {
  return (
    <Progress
      classNames={{
        track: 'border border-default bg-outline',
        indicator: 'bg-foreground-2',
        label: 'text-sm font-normal text-foreground-1',
        value: 'text-sm font-normal text-foreground'
      }}
      label={
        <div className="flex items-center gap-x-2">
          <ThirdPartyLogo className="size-6 min-w-6" url={logo} />
          <span className="text-foreground-2">{label}</span>
          <span className="text-foreground-1">{symbol}</span>
        </div>
      }
      radius="sm"
      showValueLabel={true}
      value={value}
    />
  );
}

function SecuredAVSList({ avsList, avsError, isOperatorLoading }) {
  const navigate = useNavigate();
  if (avsError) {
    return (
      <div className="rd-box flex h-full w-full flex-1 flex-col items-center justify-center">
        <ErrorMessage error={avsError} />
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
        <TableBody>
          {isOperatorLoading &&
            [...new Array(10)].map((_, i) => (
              <TableRow className="border-t border-outline" key={i}>
                <TableCell className="w-full p-4">
                  <Skeleton className="h-4 rounded-md" />
                </TableCell>
              </TableRow>
            ))}

          {!isOperatorLoading &&
            avsList.map(avs => (
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
