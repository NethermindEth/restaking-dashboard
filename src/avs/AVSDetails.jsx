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
import LSTDistribution from './LSTDistribution';
import Operators from './Operators';
import OperatorsOverTime from './OperatorsOverTime';
import RestakersOverTime from './RestakersOverTime';
import RestakingLeaderboard from './RestakingLeaderboard';
import { strategiesData } from './strategies.mapping';
import TVLOverTime from './TVLOverTime';

export default function AVSDetails() {
  const location = useLocation();
  const avsAddress = location.pathname.split('/')[2];
  const { avsService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    avsDetails: null,
    timelineTab: '7days'
  });

  const handleTimelineChange = tab => {
    dispatch({ timelineTab: tab });
  };

  const getStrategyData = (state, proxyAddress) => {
    return state?.avsDetails?.strategies?.find(s => s.address === proxyAddress);
  };

  const calculateTVL = strategyData => {
    const shares = BigInt(strategyData?.shares || '0');
    const tokens = BigInt(strategyData?.tokens || '0');
    return Number((shares + tokens) / BigInt(1e18));
  };

  const formatTVL = tvl => {
    return tvl < 1e-18 ? '0' : assetFormatter.format(tvl);
  };

  const lstDistributionData = strategiesData
    .map(strategy => {
      const proxyAddress = strategy.proxy;
      const strategyData = getStrategyData(state, proxyAddress);

      return strategyData
        ? { ...strategy, tvl: calculateTVL(strategyData) }
        : { ...strategy, tvl: 0 };
    })
    .filter(
      strategy =>
        ![
          '0xbeac0eeeeeeeeeeeeeeeeeeeeeeeeeeeeeebeac0',
          '0xacb55c530acdb2849e6d4f36992cd8c9d50ed8f7'
        ].includes(strategy.proxy)
    );

  const findStrategyByProxy = proxy =>
    strategiesData.find(strategy => strategy.proxy === proxy);

  const calculateSpecialTVL = (entry, condition) => {
    if (!entry || !state?.avsDetails) return BigInt(0);

    if (condition) {
      const strategy = getStrategyData(state, entry.proxy);
      return strategy ? BigInt(strategy.tokens) : BigInt(0);
    }

    return BigInt(0);
  };

  const eigenEntry = findStrategyByProxy(
    '0xacb55c530acdb2849e6d4f36992cd8c9d50ed8f7'
  );
  const beaconEntry = findStrategyByProxy(
    '0xbeac0eeeeeeeeeeeeeeeeeeeeeeeeeeeeeebeac0'
  );

  const eigenTVL = calculateSpecialTVL(
    eigenEntry,
    state?.avsDetails?.address === '0x870679e138bcdf293b7ff14dd44b70fc97e12fc0'
  );
  const beaconTVL = calculateSpecialTVL(beaconEntry, true);

  const liquidityStakedTVL = lstDistributionData.reduce(
    (sum, strategy) => sum + strategy.tvl,
    0
  );

  const totalTVL =
    Number(eigenTVL / BigInt(1e18)) +
    Number(beaconTVL / BigInt(1e18)) +
    liquidityStakedTVL;

  const convertToEther = bigIntValue => Number(bigIntValue / BigInt(1e18));

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

  useEffect(() => {
    async function fetchAvsDetails() {
      try {
        const data = await avsService.getAvsDetails(avsAddress);
        dispatch({ avsDetails: data });
      } catch {
        // TODO: handle error
      }
    }
    // TODO: loading indicators
    fetchAvsDetails();
  }, [avsService, dispatch]);

  if (state.avsDetails === null) {
    return null;
  }

  return (
    <div className="basis-1/2 w-full space-y-4">
      <Card radius="md" className="bg-content1 border border-outline p-4">
        <CardBody>
          <div className="flex flex-row gap-x-2 items-center">
            <img
              src={state.avsDetails.metadata.logo}
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
            {state.avsDetails.metadata.description}
          </div>

          <div className="space-y-2">
            <div className="py-4 text-sm text-secondary">
              https://docs.eigenlayer.xyz/eigenda/overview/
            </div>
            <div className="flex flex-row gap-x-1 mt-4">
              <Button
                as={Link}
                href={`https://etherscan.io/address/${state.avsDetails.address}`}
                target="_blank"
                showAnchorIcon
                size="sm"
                variant="flat"
                className="text-secondary"
              >{`${state.avsDetails.address.slice(0, 6)}...${state.avsDetails.address.slice(-4)}`}</Button>
              <Button
                as={Link}
                href={state.avsDetails.metadata.twitter}
                target="_blank"
                showAnchorIcon
                size="sm"
                variant="flat"
                className="text-secondary"
              >
                @
                {state.avsDetails.metadata.twitter.substring(
                  state.avsDetails.metadata.twitter.lastIndexOf('/') + 1
                )}
              </Button>
              <Button
                as={Link}
                href={state.avsDetails.metadata.website}
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
            <Card radius="md" className="bg-content1 border border-outline p-4">
              <CardHeader className="flex items-end flex-wrap justify-between gap-3">
                <div className="space-y-1 block">
                  <div className="font-light text-lg text-foreground-1">
                    TVL overtime
                  </div>
                  <div className="font-light">
                    <div className="text-base flex items-center gap-2">
                      <span>4,554,567 ETH</span>{' '}
                      <span className="text-success">+1.5%</span>
                    </div>
                    <div className="text-sm text-foreground-1">
                      $ 34,554,567
                    </div>
                  </div>
                </div>
                <GraphTimelineSelector
                  timelineTab={state.timelineTab}
                  onTimelineChange={handleTimelineChange}
                />
              </CardHeader>
              <CardBody>
                <TVLOverTime />
              </CardBody>
            </Card>
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
              <div className="font-bold">{state.avsDetails.operators}</div>
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
                  timelineTab={state.timelineTab}
                  onTimelineChange={handleTimelineChange}
                />
              </CardHeader>

              <CardBody>
                <OperatorsOverTime />
              </CardBody>
            </Card>
            <Operators />
          </div>
        </Tab>
        <Tab
          key="restakers"
          disabled
          title={
            <div className="text-center">
              <div>Restakers</div>
              <div className="font-bold">{state.avsDetails.stakers}</div>
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
                  timelineTab={state.timelineTab}
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
