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
    isFetchingTopOperators: false
  });

  const fetchTopAVS = useCallback(async () => {
    try {
      dispatch({ isFetchingTopAVS: true });
      const data = await avsService.getTopAVS();
      dispatch({
        topAVS: data.results,
        totalAVSCount: data.totalCount,
        isFetchingTopAVS: false
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
        isFetchingTopOperators: false
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
      <div className="flex items-stretch md:flex-row flex-col gap-4 justify-between w-full">
        <Card
          radius="md"
          className="bg-content1 border border-outline flex md:flex-row items-center justify-around w-full p-4 md:space-y-0 space-y-4"
        >
          <div className="space-y-1 text-center">
            <div className="font-light text-sm text-foreground-1">
              EigenLayer TVL
            </div>
            {state.isFetchingEigenTVL ? (
              <Skeleton className="w-full rounded-md h-8 bg-default dark:bg-default" />
            ) : (
              <div className="text-2xl font-normal text-white">
                {formatNumber(parseFloat(state.latestEigenTVL) / 1e18, compact)}{' '}
                ETH
              </div>
            )}
          </div>

          <Divider orientation="vertical" className="h-12 hidden md:block" />
          <Divider orientation="horizontal" className="w-8/12 md:hidden" />

          <div className="space-y-1 text-center">
            <div className="font-light text-sm text-foreground-1">
              Total AVS
            </div>
            {state.isFetchingTopAVS ? (
              <Skeleton className="w-full rounded-md h-8 bg-default dark:bg-default" />
            ) : (
              <div className="text-2xl font-normal text-white">
                {state.totalAVSCount}
              </div>
            )}
          </div>
          <Divider orientation="vertical" className="h-12 hidden md:block" />
          <Divider orientation="horizontal" className="w-8/12 md:hidden" />
          <div className="space-y-1 text-center">
            <div className="font-light text-sm text-foreground-1">
              Total Operators
            </div>
            {state.isFetchingTopOperators ? (
              <Skeleton className="w-full rounded-md h-8 bg-default dark:bg-default" />
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
      <div className="flex items-stretch md:flex-row flex-col justify-between gap-4">
        <Card
          radius="md"
          className="bg-content1 border border-outline space-y-4 p-4 w-full"
        >
          <div className="font-light text-base text-foreground-1">Top AVS</div>
          <div className="text-sm">
            <div className="flex flex-row gap-x-2 justify-between items-center p-4 text-foreground-1">
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
                  className={`border-t border-outline flex flex-row gap-x-2 justify-between items-center p-4 cursor-pointer hover:bg-default text-white text-sm`}
                >
                  <img
                    className="h-5 rounded-full min-w-5"
                    src={avs.metadata.logo}
                  />
                  <span className="basis-full truncate">
                    {avs?.metadata?.name}
                  </span>
                  <span className="basis-1/2">
                    {formatNumber(avs.operators, compact)}
                  </span>
                  <span className="basis-1/3 text-end min-w-fit">
                    <div>ETH {formatNumber(avs.strategiesTotal, compact)}</div>
                  </span>
                </Link>
              ))
            )}
          </div>
        </Card>
        <Card
          radius="md"
          className="bg-content1 border border-outline space-y-4 p-4 w-full"
        >
          <div className="font-light text-base text-foreground-1">
            Top Operators
          </div>
          <div className="text-sm">
            <div className="flex flex-row gap-x-2 justify-between items-center p-4 text-foreground-1">
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
                  className={`border-t border-outline flex flex-row gap-x-2 justify-between items-center p-4 cursor-pointer hover:bg-default text-white text-sm`}
                >
                  <img
                    className="h-5 rounded-full min-w-5"
                    src={op.metadata.logo}
                  />
                  <span className="basis-full truncate">
                    {op?.metadata?.name}
                  </span>
                  <span className="basis-1/2">
                    {formatNumber(op.stakerCount, compact)}
                  </span>
                  <span className="basis-1/3 text-end min-w-fit">
                    <div>ETH {formatNumber(op.strategiesTotal, compact)}</div>
                  </span>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>

      <EigenLayerTVLOvertime eigenTVLData={state.eigenTVLData} />
      <OverviewLRTDistribution />
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
          className="bg-cinder-1 hover:bg-cinder-4 cursor-pointer flex flex-row items-center justify-normal gap-3 px-4 py-2.5 group w-full"
        >
          <div>
            <img src="/nethermind.png" />
          </div>
          <div className="space-y-1">
            <div className="text-cinder-2 group-hover:text-accent-default font-semibold text-base">
              Start Restaking
            </div>
            <div className="text-cinder-3 group-hover:text-accent-default text-sm font-light">
              Nethermind Operator
            </div>
          </div>
          <ChevronRightIcon className="size-6 ml-2 text-cinder-3" />
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
          className="bg-cinder-1 hover:bg-cinder-4 cursor-pointer flex flex-row items-center justify-normal gap-3 px-4 py-2.5 group w-full"
        >
          <div>
            <img src="/nethermind.png" />
          </div>
          <div className="space-y-1">
            <div className="text-cinder-2 group-hover:text-accent-default font-semibold text-base">
              Audit Smart Contract
            </div>
            <div className="text-cinder-3 group-hover:text-accent-default text-sm font-light">
              Audit AVS with Nethermind
            </div>
          </div>
          <ChevronRightIcon className="size-6 ml-2 text-cinder-3" />
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
          className="p-4 flex justify-normal gap-4 md:gap-8 text-foreground-1 border-t border-outline w-full"
        >
          <div className="md:w-10/12 w-6/12">
            <Skeleton className="h-6 rounded-md w-4/5 md:w-2/3 dark:bg-default" />
          </div>
          <div className="pl-5 flex justify-between gap-5 w-10/12">
            <div className="w-3/12">
              <Skeleton className="h-6 rounded-md w-full bg-default dark:bg-default" />
            </div>
            <div className="w-3/12">
              <Skeleton className="h-6 rounded-md w-full bg-default dark:bg-default" />
            </div>
            <div className="w-3/12">
              <Skeleton className="h-6 rounded-md w-full bg-default dark:bg-default" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
