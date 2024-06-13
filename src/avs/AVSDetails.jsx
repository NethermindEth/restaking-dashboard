import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Link,
  Tab,
  Tabs
} from '@nextui-org/react';
import assets from '../shared/assets';
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

export default function AVSDetails({ avs }) {
  const location = useLocation();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    avs: location.state.avs,
    timelineTab: '7days'
  });

  const handleTimelineChange = tab => {
    dispatch({ timelineTab: tab });
  };

  return (
    <div className="basis-1/2 w-full space-y-4">
      <Card radius="md" className="bg-content1 border border-outline p-4">
        <CardBody>
          <div className="flex flex-row gap-x-2 items-center">
            <div
              className="bg-contain bg-no-repeat h-8 rounded-full min-w-8"
              style={{ backgroundImage: `url('${state.avs.metadata.logo}')` }}
            ></div>
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
            <LSTDistribution />
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
