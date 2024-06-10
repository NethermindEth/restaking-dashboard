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

export default function AVSDetails({ avs }) {
  const location = useLocation();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    avs: location.state.avs
  });

  return (
    <div className="basis-1/2 px-4 w-full space-y-4">
      <Card radius="md" className="bg-content1 border border-outline p-4">
        <CardBody>
          <div className="flex flex-row gap-x-2 items-center">
            <div
              className="bg-contain bg-no-repeat h-8 rounded-full min-w-8"
              style={{ backgroundImage: `url('${state.avs.metadata.logo}')` }}
            ></div>
            <span className="basis-full font-bold text-xl truncate text-foreground-1">
              {state.avs?.metadata?.name}
            </span>
          </div>
          <div className="py-4 text-sm">{state.avs.metadata.description}</div>
          <div className="flex flex-row gap-x-1 mt-4">
            <Button
              as={Link}
              href={`https://etherscan.io/address/${state.avs.address}`}
              target="_blank"
              showAnchorIcon
              size="sm"
              variant="flat"
            >{`${state.avs.address.slice(0, 6)}...${state.avs.address.slice(-4)}`}</Button>
            <Button
              as={Link}
              href={state.avs.metadata.twitter}
              target="_blank"
              showAnchorIcon
              size="sm"
              variant="flat"
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
            >
              Website
            </Button>
          </div>
        </CardBody>
      </Card>
      <Tabs
        className="w-full border border-outline p-2 rounded-lg"
        classNames={{
          tab: 'px-6 py-8',
          tabList: 'bg-content1 w-full'
        }}
        disabledKeys={['stakers']}
      >
        <Tab
          key="assets"
          title={
            <div className="text-center">
              <div>Assets</div>
              <div className="font-bold">
                {assetFormatter.format(formatEther(state.avs.tvl))}
              </div>
            </div>
          }
        >
          <div>
            {Object.entries(state.avs.strategies)
              .sort(compareStrategies)
              .map(([strategy, value], i) => (
                <div
                  key={`strategy-item-${i}`}
                  className={`border-t border-outline flex flex-row gap-x-2 justify-between items-center p-4 hover:bg-default`}
                >
                  <div>{assets[strategy]?.name ?? ''}</div>
                  <div className="bg-default px-1 py-0.5 rounded text-xs">
                    {assets[strategy]?.symbol ?? ''}
                  </div>
                  <div className="grow text-end">
                    {assetFormatter.format(formatEther(value))}
                  </div>
                </div>
              ))}
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
          <div className="space-y-4">
            <Card radius="md" className="bg-content1 border border-outline p-4">
              <CardHeader className="space-y-1 block">
                <div className=" font-light text-lg text-foreground-1">
                  Operators over time
                </div>
                <div className=" font-light text-base">
                  364 <span className="text-success">+2.3%</span>
                </div>
              </CardHeader>
              <CardBody>
                <OperatorsOverTime />
              </CardBody>
            </Card>
            <Operators />
          </div>
        </Tab>
        <Tab
          key="stakers"
          disabled
          title={
            <div className="text-center">
              <div>Stakers</div>
              <div className="font-bold">{state.avs.stakers}</div>
            </div>
          }
        />
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
