import {
  allStrategyAssetMapping,
  BEACON_STRATEGY,
  EIGEN_STRATEGY
} from '../shared/strategies';
import { Progress, Skeleton, Spinner } from '@nextui-org/react';
import OperatorLSTPieChart from './charts/OperatorLSTPieChart';
import OperatorRestakersLineChart from './charts/OperatorRestakersLineChart';
import OperatorTVLLineChart from './charts/OperatorTVLLineChart';
import { ParentSize } from '@visx/responsive';
import { reduceState } from '../shared/helpers';
import ThirdPartyLogo from '../shared/ThirdPartyLogo';
import { useEffect } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { useParams } from 'react-router-dom';
import { useServices } from '../@services/ServiceContext';

export default function OperatorDetails() {
  const { address } = useParams();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    ethRate: 1,
    operator: undefined,
    isOperatorLoading: true,
    tvl: 0
  });
  const { operatorService } = useServices();

  useEffect(() => {
    dispatch({ isOperatorLoading: true });

    (async () => {
      const operator = await operatorService.getOperator(address);
      const tvl = operator.strategies.reduce((acc, s) => {
        if (s.address === EIGEN_STRATEGY) {
          return acc;
        }
        return (acc += BigInt(s.tokens));
      }, 0n);

      dispatch({
        operator,
        tvl: parseFloat(tvl) / 1e18,
        ethRate: operator.rate,
        isOperatorLoading: false
      });
    })();
  }, [address, dispatch, operatorService]);

  return (
    <>
      {state.isOperatorLoading ? (
        <>
          <div className="mb-4 min-h-[180px] w-full rounded-lg border border-outline bg-content1 p-4">
            <div className="flex max-w-[300px] items-center">
              <Skeleton className="size-12 shrink-0 rounded-full border border-outline" />
              <Skeleton className="ml-2 h-8 w-full rounded-md" />
            </div>
            <div className="my-4">
              <Skeleton className="h-16 w-full rounded-md" />
            </div>
          </div>
        </>
      ) : (
        <></>
      )}

      <div>
        <OperatorTVLLineChart
          currentTVL={state.tvl}
          ethRate={state.ethRate}
          isOperatorLoading={state.isOperatorLoading}
        />
      </div>

      <div>
        <OperatorRestakersLineChart
          isOperatorLoading={state.isOperatorLoading}
          restakers={state.operator?.stakerCount}
        />
      </div>

      <div>
        <LSTDistribution
          ethRate={state.ethRate}
          isOperatorLoading={state.isOperatorLoading}
          strategies={state.operator?.strategies}
          tvl={state.tvl}
        />
      </div>
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

    for (const s of strategies) {
      if (s.address !== EIGEN_STRATEGY && s.address !== BEACON_STRATEGY) {
        filteredStrategies.push(s);
      }

      if (s.address === BEACON_STRATEGY) {
        excludeBeaconTVL = parseFloat(s.tokens) / 1e18;
      }
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
      if (lstDistribution[i].address) {
        const { address } = lstDistribution[i];
        lstDistribution[i].symbol = allStrategyAssetMapping[address].symbol;
        lstDistribution[i].logo = allStrategyAssetMapping[address].logo;
      } else {
        lstDistribution[i].symbol = 'Others';
        lstDistribution[i].logo = allStrategyAssetMapping[BEACON_STRATEGY].logo;
      }
      lstDistribution[i].tokensInETH =
        parseFloat(lstDistribution[i].tokens) / 1e18;
    }

    dispatch({
      lstTVL: tvl - excludeBeaconTVL,
      lstDistribution
    });
  }, [dispatch, strategies, tvl]);

  if (isOperatorLoading) {
    return (
      <div className="mb-4 flex h-[410px] w-full items-center justify-center rounded-lg border border-outline bg-content1 p-4 lg:h-[410px]">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7 rounded-lg border border-outline bg-content1 p-4">
      <div className="text-foreground-1">LST distribution</div>
      <div className="flex flex-col gap-7 lg:flex-row">
        <div className="flex w-full basis-3/4 flex-col gap-y-3">
          {state.lstDistribution.map((strategy, i) => {
            return (
              <LSTShare
                key={`lst-distribution-item-${i}`}
                label={strategy.symbol}
                logo={strategy.logo}
                value={(strategy.tokensInETH / state.lstTVL) * 100}
              />
            );
          })}
        </div>
        <div className="w-full basis-1/4">
          <ParentSize className="">
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

const LSTShare = ({ label, logo, value }) => {
  return (
    <Progress
      classNames={{
        base: 'lg:w-md w-full',
        track: 'border border-default bg-cinder-1 drop-shadow-md',
        indicator: 'bg-cinder-5',
        label: 'text-xs font-normal text-foreground-1',
        value: 'text-xs font-normal text-foreground'
      }}
      label={
        <div className="flex items-center gap-x-1">
          <ThirdPartyLogo
            className="size-3 min-w-3 border-1 text-xs"
            url={logo}
          />{' '}
          {label}
        </div>
      }
      radius="sm"
      showValueLabel={true}
      value={value}
    />
  );
};
