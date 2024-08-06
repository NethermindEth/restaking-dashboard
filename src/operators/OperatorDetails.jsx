import {
  allStrategyAssetMapping,
  BEACON_STRATEGY,
  EIGEN_STRATEGY
} from '../shared/strategies';
import { handleServiceError, reduceState } from '../shared/helpers';
import { Link, Progress, Skeleton, Spinner } from '@nextui-org/react';
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
import { useParams } from 'react-router-dom';
import { useServices } from '../@services/ServiceContext';
import { useTailwindBreakpoint } from '../shared/hooks/useTailwindBreakpoint';

export default function OperatorDetails() {
  const { address } = useParams();
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
        <div className="mb-4 min-h-[180px] w-full rounded-lg border border-outline bg-content1 p-4">
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
        <div className="mb-4 flex min-h-[180px] w-full items-center justify-center rounded-lg border border-outline bg-content1 p-4">
          <ErrorMessage error={state.error} />
        </div>
      )}

      {!state.isOperatorLoading && !state.error && (
        <>
          <div className="mb-4 flex w-full flex-row flex-wrap items-center gap-x-5 gap-y-2 break-words rounded-lg border border-outline bg-content1 p-4">
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
          <div className="mb-4 flex flex-row items-center justify-between rounded-lg border border-outline bg-content1 p-2">
            <div className="flex basis-1/3 flex-col items-center gap-1">
              <span className="text-sm text-foreground-2">TVL</span>
              <span className="text-center">
                {state.tvl && (
                  <span className="text-foreground-1">
                    {formatETH(state.tvl, compact)}
                  </span>
                )}
              </span>
            </div>
            <div className="flex h-full min-h-10 basis-1/3 flex-col items-center gap-2 border-x border-outline px-2">
              <span className="text-center text-sm text-foreground-2">
                AVS subscribed
              </span>
              <span className="text-foreground-1">
                {state.operator?.avs?.length}
              </span>
            </div>
            <div className="flex basis-1/3 flex-col items-center gap-1">
              <span className="text-sm text-foreground-2">Restakers</span>
              <span className="text-foreground-1">
                {state.operator?.stakerCount}
              </span>
            </div>
          </div>
        </>
      )}
      <OperatorTVLLineChart
        currentTVL={state.tvl}
        ethRate={state.ethRate}
        isOperatorLoading={state.isOperatorLoading}
      />
      <OperatorRestakersLineChart
        isOperatorLoading={state.isOperatorLoading}
        restakers={state.operator?.stakerCount}
      />
      <LSTDistribution
        ethRate={state.ethRate}
        isOperatorLoading={state.isOperatorLoading}
        strategies={state.operator?.strategies}
        tvl={state.tvl}
      />
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
      <div className="flex h-[410px] w-full items-center justify-center rounded-lg border border-outline bg-content1 p-4 lg:h-[410px]">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  if (state.lstDistribution.length === 0) {
    return (
      <div className="flex h-[410px] items-center justify-center rounded-lg border border-outline bg-content1 p-4">
        <div>
          <ErrorMessage message="No strategies available" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-7 rounded-lg border border-outline bg-content1 p-4">
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
