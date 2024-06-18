import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Link,
  Tab,
  Tabs
} from '@nextui-org/react';
import { useLocation } from 'react-router-dom';
import { useMutativeReducer } from 'use-mutative';
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
  const [state, dispatch] = useMutativeReducer(reduceState, {
    avs: location.state.avs,
    timelineTab: '7days'
  });

  const handleTimelineChange = tab => {
    dispatch({ timelineTab: tab });
  };

  const lstDistributionData = strategiesData
    .map(strategy => {
      const proxyAddress = strategy.proxy.toLowerCase();
      const strategyData = state.avs.strategies[proxyAddress];

      if (strategyData) {
        const shares = BigInt(strategyData.shares || '0');
        const tokens = BigInt(strategyData.tokens || '0');
        const tvl = shares + tokens;

        return {
          ...strategy,
          tvl: Number(tvl / BigInt(1e18))
        };
      } else {
        return {
          ...strategy,
          tvl: 0
        };
      }
    })
    .filter(
      strategy =>
        strategy.proxy.toLowerCase() !==
          '0xbeaC0eeEeeeeEEeEeEEEEeeEEeEeeeEeeEEBEaC0'.toLowerCase() &&
        strategy.proxy.toLowerCase() !==
          '0xacb55c530acdb2849e6d4f36992cd8c9d50ed8f7'.toLowerCase()
    );

  const beaconEntry = strategiesData.find(
    strategy =>
      strategy.proxy.toLowerCase() ===
      '0xbeaC0eeEeeeeEEeEeEEEEeeEEeEeeeEeeEEBEaC0'.toLowerCase()
  );

  const eigenEntry = strategiesData.find(
    strategy =>
      strategy.proxy.toLowerCase() ===
      '0xacb55c530acdb2849e6d4f36992cd8c9d50ed8f7'.toLowerCase()
  );

  const eigenTVL = eigenEntry
    ? state.avs.address.toLowerCase() ===
      '0x870679e138bcdf293b7ff14dd44b70fc97e12fc0'.toLowerCase()
      ? BigInt(
          state.avs.strategies[eigenEntry.proxy.toLowerCase()]?.tokens || '0'
        )
      : BigInt(0)
    : BigInt(0);

  const beaconTVL = beaconEntry
    ? BigInt(
        state.avs.strategies[beaconEntry.proxy.toLowerCase()]?.tokens || '0'
      )
    : BigInt(0);

  const liquidityStakedTVL = lstDistributionData.reduce(
    (sum, strategy) => sum + strategy.tvl,
    0
  );

  const totalTVL =
    Number(eigenTVL / BigInt(1e18)) +
    Number(beaconTVL / BigInt(1e18)) +
    liquidityStakedTVL;

  const formatTVL = tvl => {
    if (tvl < 1e-18) {
      return '0';
    } else {
      return assetFormatter.format(tvl);
    }
  };

  const beaconTVLInEther = Number(beaconTVL / BigInt(1e18));
  const eigenTVLInEther = Number(eigenTVL / BigInt(1e18));

  const totalEthDistributionData = [
    beaconEntry && {
      ...beaconEntry,
      token: beaconEntry.token,
      tvl: beaconTVLInEther,
      tvlPercentage: ((beaconTVLInEther / totalTVL) * 100).toFixed(2)
    },
    eigenEntry && {
      ...eigenEntry,
      token: eigenEntry.token,
      tvl: eigenTVLInEther,
      tvlPercentage: ((eigenTVLInEther / totalTVL) * 100).toFixed(2)
    },
    {
      name: 'Liquidity Staked Tokens',
      logo: 'https://w7.pngwing.com/pngs/268/1013/png-transparent-ethereum-eth-hd-logo-thumbnail.png',
      tvl: liquidityStakedTVL,
      tvlPercentage: ((liquidityStakedTVL / totalTVL) * 100).toFixed(2)
    }
  ].filter(Boolean);

  return (
    <div className="basis-1/2 w-full space-y-4">
      <Card radius="md" className="bg-content1 border border-outline p-4">
        <CardBody>
          <div className="flex flex-row gap-x-2 items-center">
            <img
              src={state.avs.metadata.logo}
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
            {state.avs.metadata.description}
          </div>

          <div className="space-y-2">
            <div className="py-4 text-sm text-secondary">
              https://docs.eigenlayer.xyz/eigenda/overview/
            </div>
            <div className="flex flex-row gap-x-1 mt-4">
              <Button
                as={Link}
                href={`https://etherscan.io/address/${state.avs.address}`}
                target="_blank"
                showAnchorIcon
                size="sm"
                variant="flat"
                className="text-secondary"
              >{`${state.avs.address.slice(0, 6)}...${state.avs.address.slice(-4)}`}</Button>
              <Button
                as={Link}
                href={state.avs.metadata.twitter}
                target="_blank"
                showAnchorIcon
                size="sm"
                variant="flat"
                className="text-secondary"
              >
                @
                {state.avs.metadata.twitter.substring(
                  state.avs.metadata.twitter.lastIndexOf('/') + 1
                )}
              </Button>
              <Button
                as={Link}
                href={state.avs.metadata.website}
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
              <div className="font-bold">{formatTVL(state.avs.tvl)}</div>
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
              <div className="font-bold">{state.avs.operators}</div>
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
              <div className="font-bold">{state.avs.stakers}</div>
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
