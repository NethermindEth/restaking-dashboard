import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Link,
  Tab,
  Tabs
} from '@nextui-org/react';
import { formatEther } from 'ethers';
import { reduceState } from '../shared/helpers';
import { useLocation } from 'react-router-dom';
import { useMutativeReducer } from 'use-mutative';
import OperatorsOverTime from './OperatorsOverTime';
import Operators from './Operators';
import RestakersOverTime from './RestakersOverTime';
import RestakingLeaderboard from './RestakingLeaderboard';
import TVLOverTime from './TVLOverTime';
import LSTDistribution from './LSTDistribution';
import GraphTimelineSelector from './GraphTimelineSelector';

const strategiesData = [
  {
    name: 'Coinbase Staked Ether',
    logo: '/public/cbEth.svg',
    token: 'cbETH',
    proxy: '0x54945180dB7943c0ed0FEE7EdaB2Bd24620256bc'
  },
  {
    name: 'Lido Staked Ether',
    logo: '/public/stEth.svg',
    token: 'stETH',
    proxy: '0x93c4b944D05dfe6df7645A86cd2206016c51564D'
  },
  {
    name: 'Rocket Pool Ether',
    logo: '/public/rEth.svg',
    token: 'rETH',
    proxy: '0x1BeE69b7dFFfA4E2d53C2a2Df135C388AD25dCD2'
  },
  {
    name: 'Stader Staked Ether',
    logo: '/public/ethX.png',
    token: 'ETHx',
    proxy: '0x9d7eD45EE2E8FC5482fa2428f15C971e6369011d'
  },
  {
    name: 'Ankr Staked Ether',
    logo: '/public/ankrEth.svg',
    token: 'ankrETH',
    proxy: '0x13760F50a9d7377e4F20CB8CF9e4c26586c658ff'
  },
  {
    name: 'Origin Staked Ether',
    logo: '/public/oEth.svg',
    token: 'OETH',
    proxy: '0xa4C637e0F704745D182e4D38cAb7E7485321d059'
  },
  {
    name: 'StakeWise Staked Ether',
    logo: '/public/osEth.svg',
    token: 'osETH',
    proxy: '0x57ba429517c3473B6d34CA9aCd56c0e735b94c02'
  },
  {
    name: 'Swell Staked Ether',
    logo: '/public/swEth.svg',
    token: 'swETH',
    proxy: '0x0Fe4F44beE93503346A3Ac9EE5A26b130a5796d6'
  },
  {
    name: 'Binance Staked Ether',
    logo: '/public/wBETH.png',
    token: 'wBETH',
    proxy: '0x7CA911E83dabf90C90dD3De5411a10F1A6112184'
  },
  {
    name: 'Staked Frax Ether',
    logo: '/public/sfrxEth.svg',
    token: 'sfrxETH',
    proxy: '0x8CA7A5d6f3acd3A7A8bC468a8CD0FB14B6BD28b6'
  },
  {
    name: 'Liquid Staked Ether',
    logo: '/public/lsEth.png',
    token: 'lsETH',
    proxy: '0xAe60d8180437b5C34bB956822ac2710972584473'
  },
  {
    name: 'Mantle Staked Ether',
    logo: '/public/mEth.svg',
    token: 'mETH',
    proxy: '0x298aFB19A105D59E74658C4C334Ff360BadE6dd2'
  },
  {
    name: 'Beacon',
    logo: '/public/eth.png',
    token: 'ETH',
    proxy: '0xbeaC0eeEeeeeEEeEeEEEEeeEEeEeeeEeeEEBEaC0'
  },
  {
    name: 'Eigen',
    logo: '/public/eigen.webp',
    token: 'EIGEN',
    proxy: '0xaCB55C530Acdb2849e6d4f36992Cd8c9D50ED8F7'
  }
];

export default function AVSDetails({ avs }) {
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
      let tvl = BigInt(state.avs.strategies[strategy.proxy]);

      return {
        ...strategy,
        tvl: Number(tvl / BigInt(1e18))
      };
    })
    .filter(
      strategy =>
        strategy.proxy.toLowerCase() !==
          '0xbeaC0eeEeeeeEEeEeEEEEeeEEeEeeeEeeEEBEaC0'.toLowerCase() &&
        strategy.proxy.toLowerCase() !==
          '0xaCB55C530Acdb2849e6d4f36992Cd8c9D50ED8F7'.toLowerCase()
    );

  const beaconEntry = strategiesData.find(
    strategy => strategy.proxy === '0xbeaC0eeEeeeeEEeEeEEEEeeEEeEeeeEeeEEBEaC0'
  );

  const eigenEntry = strategiesData.find(
    strategy => strategy.proxy === '0xaCB55C530Acdb2849e6d4f36992Cd8c9D50ED8F7'
  );

  const eigenTVL = eigenEntry
    ? state.avs.address === '0x870679E138bCdf293b7Ff14dD44b70FC97e12fc0'
      ? BigInt(state.avs.strategies[eigenEntry.proxy])
      : BigInt(0)
    : BigInt(0);

  const beaconTVL = beaconEntry
    ? BigInt(state.avs.strategies[beaconEntry.proxy])
    : BigInt(0);

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
      tvl: Number(beaconTVL / BigInt(1e18)),
      tvlPercentage: (
        (Number(beaconTVL / BigInt(1e18)) / totalTVL) *
        100
      ).toFixed(2)
    },
    eigenEntry && {
      ...eigenEntry,
      token: eigenEntry.token,
      tvl: Number(eigenTVL / BigInt(1e18)),
      tvlPercentage: (
        (Number(eigenTVL / BigInt(1e18)) / totalTVL) *
        100
      ).toFixed(2)
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
              <div className="font-bold">
                {assetFormatter.format(formatEther(state.avs.tvl))}
              </div>
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

const assetFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2
});
const compareStrategies = ([, i1], [, i2]) => {
  if (i1 < i2) {
    return 1;
  }

  if (i1 > i2) {
    return -1;
  }

  return 0;
};
