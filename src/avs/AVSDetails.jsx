import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Link,
  Tab,
  Tabs
} from '@nextui-org/react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';
import GraphTimelineSelector from '../shared/GraphTimelineSelector';
import { reduceState } from '../shared/helpers';
import { assetFormatter } from '../utils';
import AVSTVLOverTime from './AVSTVLOverTime';
import LSTDistribution from './LSTDistribution';
import Operators from './Operators';
import OperatorsOverTime from './OperatorsOverTime';
import RestakersOverTime from './RestakersOverTime';
import RestakingLeaderboard from './RestakingLeaderboard';
import { strategiesData } from './strategies.mapping';

export default function AVSDetails() {
  const location = useLocation();
  const avsAddress = location.pathname.split('/')[2];
  const { avsService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    avsDetails: null,
    timelineTab: '7days',
    lstDistributionData: [],
    eigenTVL: BigInt(0),
    beaconTVL: BigInt(0),
    liquidityStakedTVL: 0,
    totalTVL: 0,
    totalEthDistributionData: [],
    strategiesMap: {}
  });
  const {
    avsDetails,
    timelineTab,
    lstDistributionData,
    totalTVL,
    totalEthDistributionData
  } = state;

  const handleTimelineChange = tab => {
    dispatch({ timelineTab: tab });
  };

  const createStrategiesMap = strategies => {
    return strategies.reduce((acc, strategy) => {
      acc[strategy.address] = strategy;
      return acc;
    }, {});
  };

  const calculateTVL = strategyData => {
    const tokens = BigInt(strategyData?.tokens || '0');
    return Number(tokens / BigInt(1e18));
  };

  const formatTVL = tvl => {
    return tvl < 1e-18 ? '0' : assetFormatter.format(tvl);
  };

  const calculateLstDistributionData = strategiesMap => {
    const excludedProxies = new Set([
      '0xbeac0eeeeeeeeeeeeeeeeeeeeeeeeeeeeeebeac0',
      '0xacb55c530acdb2849e6d4f36992cd8c9d50ed8f7'
    ]);

    return Object.values(strategiesData)
      .map(strategy => {
        const proxyAddress = strategy.proxy;
        const strategyData = strategiesMap[proxyAddress];

        return strategyData
          ? { ...strategy, tvl: calculateTVL(strategyData) }
          : { ...strategy, tvl: 0 };
      })
      .filter(strategy => !excludedProxies.has(strategy.proxy));
  };

  const findStrategyByProxy = proxy => strategiesData[proxy];

  // calculate eigen specific tvl
  const calculateEigenTVL = (strategiesMap, avsAddress) => {
    const eigenEntry =
      strategiesData['0xacb55c530acdb2849e6d4f36992cd8c9d50ed8f7'];
    if (!eigenEntry || !strategiesMap) return BigInt(0);

    if (avsAddress === '0x870679e138bcdf293b7ff14dd44b70fc97e12fc0') {
      const strategy = strategiesMap[eigenEntry.proxy];
      return strategy ? BigInt(strategy.tokens) : BigInt(0);
    }

    return BigInt(0);
  };

  const calculateBeaconTVL = strategiesMap => {
    const beaconEntry =
      strategiesData['0xbeac0eeeeeeeeeeeeeeeeeeeeeeeeeeeeeebeac0'];
    if (!beaconEntry || !strategiesMap) return BigInt(0);

    const strategy = strategiesMap[beaconEntry.proxy];
    return strategy ? BigInt(strategy.tokens) : BigInt(0);
  };

  function calculateDerivedValues(avsDetailsData) {
    const strategiesMap = createStrategiesMap(avsDetailsData.strategies || []);

    const lstDistributionData = calculateLstDistributionData(strategiesMap);

    const eigenEntry = findStrategyByProxy(
      '0xacb55c530acdb2849e6d4f36992cd8c9d50ed8f7'
    );
    const beaconEntry = findStrategyByProxy(
      '0xbeac0eeeeeeeeeeeeeeeeeeeeeeeeeeeeeebeac0'
    );

    const eigenTVL = calculateEigenTVL(strategiesMap, avsDetailsData.address);
    const beaconTVL = calculateBeaconTVL(strategiesMap);

    const liquidityStakedTVL = lstDistributionData.reduce(
      (sum, strategy) => sum + strategy.tvl,
      0
    );

    const totalTVL =
      Number(eigenTVL / BigInt(1e18)) +
      Number(beaconTVL / BigInt(1e18)) +
      liquidityStakedTVL;

    const totalEthDistributionData = [
      beaconEntry && {
        ...beaconEntry,
        token: beaconEntry.token,
        tvl: convertToEther(beaconTVL),
        tvlPercentage: ((convertToEther(beaconTVL) / totalTVL) * 100).toFixed(2)
      },
      eigenEntry && {
        ...eigenEntry,
        token: eigenEntry.token,
        tvl: convertToEther(eigenTVL),
        tvlPercentage: ((convertToEther(eigenTVL) / totalTVL) * 100).toFixed(2)
      },
      {
        name: 'Liquidity Staked Tokens',
        logo: 'https://w7.pngwing.com/pngs/268/1013/png-transparent-ethereum-eth-hd-logo-thumbnail.png',
        tvl: liquidityStakedTVL,
        tvlPercentage: ((liquidityStakedTVL / totalTVL) * 100).toFixed(2)
      }
    ].filter(Boolean);

    return {
      lstDistributionData,
      eigenTVL,
      beaconTVL,
      liquidityStakedTVL,
      totalTVL,
      totalEthDistributionData
    };
  }

  const convertToEther = bigIntValue => Number(bigIntValue / BigInt(1e18));

  useEffect(() => {
    async function fetchAvsDetails() {
      try {
        const avsDetailsData = await avsService.getAvsDetails(avsAddress);
        const strategiesMap = createStrategiesMap(
          avsDetailsData.strategies || []
        );
        const derivedValues = calculateDerivedValues(
          avsDetailsData,
          strategiesMap
        );

        dispatch({
          avsDetails: avsDetailsData,
          strategiesMap,
          ...derivedValues
        });
      } catch (error) {
        // TODO: handle error
      }
    }
    fetchAvsDetails();
  }, [avsService, dispatch, avsAddress]);

  if (avsDetails === null) {
    return null;
  }

  return (
    <div className="basis-1/2 w-full space-y-4">
      <Card radius="md" className="bg-content1 border border-outline p-4">
        <CardBody>
          <div className="flex flex-row gap-x-2 items-center">
            <img
              src={avsDetails.metadata.logo}
              className="size-5 rounded-full"
            />
            <div className="flex items-center gap-3">
              <span className="basis-full font-bold text-xl truncate text-foreground-1">
                {state.avs?.metadata?.name}
              </span>
              <div className="bg-foreground-2 flex text-content1 items-center justify-center py-1 px-1.5 rounded-md text-sm">
                #&nbsp;8
              </div>
            </div>
          </div>
          <div className="py-4 text-sm text-foreground-active">
            {avsDetails.metadata.description}
          </div>

          <div className="space-y-2">
            <div className="py-4 text-sm text-secondary">
              https://docs.eigenlayer.xyz/eigenda/overview/
            </div>
            <div className="flex flex-row gap-x-1 mt-4">
              <Button
                as={Link}
                href={`https://etherscan.io/address/${avsDetails.address}`}
                target="_blank"
                showAnchorIcon
                size="sm"
                variant="flat"
                className="text-secondary"
              >{`${avsDetails.address.slice(0, 6)}...${avsDetails.address.slice(-4)}`}</Button>
              <Button
                as={Link}
                href={avsDetails.metadata.twitter}
                target="_blank"
                showAnchorIcon
                size="sm"
                variant="flat"
                className="text-secondary"
              >
                @
                {avsDetails.metadata.twitter.substring(
                  avsDetails.metadata.twitter.lastIndexOf('/') + 1
                )}
              </Button>
              <Button
                as={Link}
                href={avsDetails.metadata.website}
                target="_blank"
                showAnchorIcon
                size="sm"
                variant="flat"
                className="text-secondary"
              >
                Website
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
      <Tabs
        className="w-full border border-outline p-2 rounded-lg "
        classNames={{
          tab: 'px-6 py-8',
          tabList: 'bg-content1 w-full'
        }}
        disabledKeys={['restakers']}
      >
        <Tab
          key="assets"
          title={
            <div className="text-center">
              <div>Total ETH value</div>
              <div className="font-bold">{formatTVL(totalTVL)}</div>
            </div>
          }
        >
          <div className="space-y-4 -mt-2">
            <AVSTVLOverTime avsAddress={avsAddress} />
            <LSTDistribution
              lstDistributionData={lstDistributionData}
              totalEthDistributionData={totalEthDistributionData}
            />
          </div>
        </Tab>
        <Tab
          key="operators"
          title={
            <div className="text-center">
              <div>Operators</div>
              <div className="font-bold">{avsDetails.operators}</div>
            </div>
          }
        >
          <div className="space-y-4 -mt-2">
            <Card radius="md" className="bg-content1 border border-outline p-4">
              <CardHeader className="flex items-end flex-wrap justify-between gap-3">
                <div className="space-y-1 block">
                  <div className=" font-light text-lg text-foreground-1">
                    Operators over time
                  </div>
                  <div className=" font-light text-base">
                    364 <span className="text-success">+2.3%</span>
                  </div>
                </div>
                <GraphTimelineSelector
                  timelineTab={timelineTab}
                  onTimelineChange={handleTimelineChange}
                />
              </CardHeader>

              <CardBody>
                <OperatorsOverTime />
              </CardBody>
            </Card>
            <Operators avsAddress={avsAddress} totalTVL={totalTVL} />
          </div>
        </Tab>
        <Tab
          key="restakers"
          disabled
          title={
            <div className="text-center">
              <div>Restakers</div>
              <div className="font-bold">{avsDetails.stakers}</div>
            </div>
          }
        >
          <div className="space-y-4 -mt-2">
            <Card radius="md" className="bg-content1 border border-outline p-4">
              <CardHeader className="flex items-end flex-wrap justify-between gap-3">
                <div className="space-y-1 block">
                  <div className=" font-light text-lg text-foreground-1">
                    Restakers overtime
                  </div>
                  <div className=" font-light text-base">
                    12,234 <span className="text-success">+1.5%</span>
                  </div>
                </div>
                <GraphTimelineSelector
                  timelineTab={timelineTab}
                  onTimelineChange={handleTimelineChange}
                />
              </CardHeader>

              <CardBody>
                <RestakersOverTime />
              </CardBody>
            </Card>
            <RestakingLeaderboard />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

const compareStrategies = ([, i1], [, i2]) => {
  if (i1 < i2) {
    return 1;
  }

  if (i1 > i2) {
    return -1;
  }

  return 0;
};
