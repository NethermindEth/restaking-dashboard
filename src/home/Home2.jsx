import { Card, Divider, Link, Skeleton } from '@nextui-org/react';
import { ChevronRightIcon } from '@nextui-org/shared-icons';
import { useCallback, useEffect } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import { reduceState } from '../shared/helpers';
import { useTailwindBreakpoint } from '../shared/useTailwindBreakpoint';
import { formatNumber } from '../utils';
import EigenLayerTVLOvertime from './EigenLayerTVLOvertime';
import OverviewLRTDistribution from './OverviewLRTDistribution';

export default function Home() {
  const compact = !useTailwindBreakpoint('md');
  const { avsService, operatorService, eigenlayerService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    totalAVSCount: null,
    totalOperatorsCount: null,
    topAVS: [],
    topOperators: [],
    eigenTVLData: [],
    latestEigenTVL: null,
    isFetchingEigenTVL: false,
    isFetchingTopAVS: false,
    isFetchingTopOperators: false,
    rate: 1
  });

  const fetchTopAVS = useCallback(async () => {
    try {
      dispatch({ isFetchingTopAVS: true });
      const data = await avsService.getTopAVS();
      dispatch({
        topAVS: data.results,
        totalAVSCount: data.totalCount,
        isFetchingTopAVS: false,
        rate: data.rate
      });
    } catch {
      // TODO: Handle error
      dispatch({
        isFetchingTopAVS: false
      });
    }
  }, [avsService, dispatch]);

  const fetchTopOperators = useCallback(async () => {
    try {
      dispatch({ isFetchingTopOperators: true });
      const data = await operatorService.getTopOperators();
      dispatch({
        topOperators: data.results,
        totalOperatorsCount: data.totalCount,
        isFetchingTopOperators: false,
        rate: data.rate
      });
    } catch {
      // TODO: Handle error
      dispatch({
        isFetchingTopOperators: false
      });
    }
  }, [operatorService, dispatch]);

  const fetchEigenTVL = useCallback(async () => {
    try {
      dispatch({ isFetchingEigenTVL: true });
      const eigenTVLData = await eigenlayerService.getEigenLayerTVLOvertime();
      const ethTVL =
        eigenTVLData && eigenTVLData[eigenTVLData.length - 1].ethTVL;
      const lstTVL =
        eigenTVLData && eigenTVLData[eigenTVLData.length - 1].lstTVL;

      dispatch({
        eigenTVLData,
        latestEigenTVL: BigInt(ethTVL) + BigInt(lstTVL),
        isFetchingEigenTVL: false
      });
    } catch {
      // TODO: Handle error
      dispatch({
        isFetchingEigenTVL: false
      });
    }
  }, [eigenlayerService, dispatch]);

  useEffect(() => {
    fetchEigenTVL();
    fetchTopAVS();
    fetchTopOperators();
  }, [fetchEigenTVL, fetchTopAVS, fetchTopOperators]);

  return (
    <div className="space-y-4">
      <div className="flex w-full flex-col items-stretch justify-between gap-4 md:flex-row">
        <Card
          radius="md"
          className="flex w-full items-center justify-around space-y-4 border border-outline bg-content1 p-4 md:flex-row md:space-y-0"
        >
          <div className="space-y-1 text-center">
            <div className="text-sm font-light text-foreground-1">
              EigenLayer TVL
            </div>
            {state.isFetchingEigenTVL ? (
              <Skeleton className="h-8 w-full rounded-md bg-default dark:bg-default" />
            ) : (
              <div>
                <div className="text-2xl font-normal text-white">
                  $
                  {formatNumber(
                    (parseFloat(state.latestEigenTVL) / 1e18) * state.rate,
                    compact
                  )}
                </div>
                <div className="text-sm text-success">
                  {formatNumber(
                    parseFloat(state.latestEigenTVL) / 1e18,
                    compact
                  )}{' '}
                  ETH
                </div>
              </div>
            )}
          </div>

          <Divider orientation="vertical" className="hidden h-12 md:block" />
          <Divider orientation="horizontal" className="w-8/12 md:hidden" />

          <div className="space-y-1 text-center">
            <div className="text-sm font-light text-foreground-1">
              Total AVS
            </div>
            {state.isFetchingTopAVS ? (
              <Skeleton className="h-8 w-full rounded-md bg-default dark:bg-default" />
            ) : (
              <div className="text-2xl font-normal text-white">
                {state.totalAVSCount}
              </div>
            )}
          </div>
          <Divider orientation="vertical" className="hidden h-12 md:block" />
          <Divider orientation="horizontal" className="w-8/12 md:hidden" />
          <div className="space-y-1 text-center">
            <div className="text-sm font-light text-foreground-1">
              Total Operators
            </div>
            {state.isFetchingTopOperators ? (
              <Skeleton className="h-8 w-full rounded-md bg-default dark:bg-default" />
            ) : (
              <div className="text-2xl font-normal text-white">
                {state.totalOperatorsCount}
              </div>
            )}
          </div>
        </Card>
        <div className="md:w-2/5">
          <CallToActions />
        </div>
      </div>
      <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row">
        <Card
          radius="md"
          className="w-full space-y-4 border border-outline bg-content1 p-4"
        >
          <div className="text-base font-light text-foreground-1">Top AVS</div>
          <div className="text-sm">
            <div className="flex flex-row items-center justify-between gap-x-2 p-4 text-foreground-1">
              <span className="basis-full truncate">AVS</span>
              <span className="basis-1/2">Operators</span>
              <span className="basis-1/3 text-end">TVL</span>
            </div>
            {state.isFetchingTopAVS ? (
              <ListSkeleton />
            ) : (
              state.topAVS &&
              state.topAVS.map((avs, i) => (
                <Link
                  href={`/avs/${avs.address}`}
                  key={`avs-item-${i}`}
                  className={`flex cursor-pointer flex-row items-center justify-between gap-x-2 border-t border-outline p-4 text-sm text-white hover:bg-default`}
                >
                  <img
                    className="h-5 min-w-5 rounded-full"
                    src={avs.metadata.logo}
                  />
                  <span className="basis-full truncate">
                    {avs?.metadata?.name}
                  </span>
                  <span className="basis-1/2">
                    {formatNumber(avs.operators, compact)}
                  </span>
                  <div className="min-w-fit basis-1/3 text-end">
                    <div>
                      ${formatNumber(avs.strategiesTotal * state.rate, compact)}
                    </div>
                    <div className="text-xs text-subtitle">
                      {formatNumber(avs.strategiesTotal, compact)} ETH
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
        <Card
          radius="md"
          className="w-full space-y-4 border border-outline bg-content1 p-4"
        >
          <div className="text-base font-light text-foreground-1">
            Top Operators
          </div>
          <div className="text-sm">
            <div className="flex flex-row items-center justify-between gap-x-2 p-4 text-foreground-1">
              <span className="basis-full truncate">Operators</span>
              <span className="basis-1/2">Restakers</span>
              <span className="basis-1/3 text-end">TVL</span>
            </div>
            {state.isFetchingTopOperators ? (
              <ListSkeleton />
            ) : (
              state.topOperators &&
              state.topOperators.map((op, i) => (
                <Link
                  href={`/operators/${op.address}`}
                  key={`avs-item-${i}`}
                  className={`flex cursor-pointer flex-row items-center justify-between gap-x-2 border-t border-outline p-4 text-sm text-white hover:bg-default`}
                >
                  <img
                    className="h-5 min-w-5 rounded-full"
                    src={op.metadata.logo}
                  />
                  <span className="basis-full truncate">
                    {op?.metadata?.name}
                  </span>
                  <span className="basis-1/2">
                    {formatNumber(op.stakerCount, compact)}
                  </span>
                  <div className="min-w-fit basis-1/3 text-end">
                    <div>
                      ${formatNumber(op.strategiesTotal * state.rate, compact)}
                    </div>
                    <div className="text-xs text-subtitle">
                      {formatNumber(op.strategiesTotal, compact)} ETH
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>

      <EigenLayerTVLOvertime eigenTVLData={state.eigenTVLData} />
      <OverviewLRTDistribution rate={state.rate} />
    </div>
  );
}

const CallToActions = () => {
  return (
    <div className="space-y-2">
      <Link
        href="https://app.eigenlayer.xyz/operator/0x110af279aaffb0d182697d7fc87653838aa5945e"
        target="_blank"
        rel="noreferrer"
        className="w-full"
      >
        <Card
          radius="md"
          className="group flex w-full cursor-pointer flex-row items-center justify-normal gap-3 bg-cinder-1 px-4 py-2.5 hover:bg-cinder-4"
        >
          <div>
            <img src="/nethermind.png" />
          </div>
          <div className="space-y-1">
            <div className="text-base font-semibold text-cinder-2 group-hover:text-accent-default">
              Start Restaking
            </div>
            <div className="text-sm font-light text-cinder-3 group-hover:text-accent-default">
              Nethermind Operator
            </div>
          </div>
          <ChevronRightIcon className="ml-2 size-6 text-cinder-3" />
        </Card>
      </Link>
      <Link
        href="https://www.nethermind.io/nethermind-security"
        target="_blank"
        rel="noreferrer"
        className="w-full"
      >
        <Card
          radius="md"
          className="group flex w-full cursor-pointer flex-row items-center justify-normal gap-3 bg-cinder-1 px-4 py-2.5 hover:bg-cinder-4"
        >
          <div>
            <img src="/nethermind.png" />
          </div>
          <div className="space-y-1">
            <div className="text-base font-semibold text-cinder-2 group-hover:text-accent-default">
              Audit Smart Contract
            </div>
            <div className="text-sm font-light text-cinder-3 group-hover:text-accent-default">
              Audit AVS with Nethermind
            </div>
          </div>
          <ChevronRightIcon className="ml-2 size-6 text-cinder-3" />
        </Card>
      </Link>
    </div>
  );
};

const ListSkeleton = () => {
  return (
    <div>
      {[...Array(3)].map((item, i) => (
        <div
          key={i}
          className="flex w-full justify-normal gap-4 border-t border-outline p-4 text-foreground-1 md:gap-8"
        >
          <div className="w-6/12 md:w-10/12">
            <Skeleton className="h-6 w-4/5 rounded-md dark:bg-default md:w-2/3" />
          </div>
          <div className="flex w-10/12 justify-between gap-5 pl-5">
            <div className="w-3/12">
              <Skeleton className="h-6 w-full rounded-md bg-default dark:bg-default" />
            </div>
            <div className="w-3/12">
              <Skeleton className="h-6 w-full rounded-md bg-default dark:bg-default" />
            </div>
            <div className="w-3/12">
              <Skeleton className="h-6 w-full rounded-md bg-default dark:bg-default" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
