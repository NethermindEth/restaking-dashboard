import { Card, CardBody, CardHeader, Divider } from '@nextui-org/react';
import React, { useEffect } from 'react';
import GraphTimelineSelector from '../shared/GraphTimelineSelector';
import TVLOverTime from './TVLOverTime';
import RestakingLeaderboard from './RestakingLeaderboard';
import RestakerTrend from './RestakerTrend';
import { useParams } from 'react-router-dom';
import { useServices } from '../@services/ServiceContext';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';
import { formatEther } from 'ethers';
import LSTDistribution from './LSTDistribution';

const OperatorDetails = () => {
  const { address } = useParams();
  const { operatorService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    operatorTVL: 0
  });
  const handleTimelineChange = tab => {
    // dispatch({ timelineTab: tab });
    console.log(tab);
  };

  const calculateTVL = strategies => {
    const tvl = strategies.reduce((acc, s) => {
      if (s.address === '0xacb55c530acdb2849e6d4f36992cd8c9d50ed8f7') {
        return acc;
      }
      return (acc += BigInt(s.tokens));
    }, 0n);
    return tvl;
  };

  const fetchOperator = async () => {
    try {
      const data = await operatorService.getOperator(address);
      const operatorTVL = calculateTVL(data.strategies);
      dispatch({ operator: data, operatorTVL });
    } catch {
      // TODO: handle error
    }
  };

  const assetFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });

  useEffect(() => {
    fetchOperator();
  }, []);

  return (
    <div className="w-full space-y-4">
      <Card
        radius="md"
        className="bg-content1 border border-outline w-full space-y-4"
      >
        <CardBody className="space-y-4">
          <div className="flex flex-row gap-x-2 items-center">
            <div className="flex items-center gap-3">
              <span className="text-foreground-2 text-3xl font-medium">
                {state.operator?.metadata?.name}
              </span>
            </div>
          </div>
          <div className="py-4 text-sm text-foreground-2">
            {state.operator?.metadata?.description}
          </div>
          <div className="w-full h-20 flex rounded-lg border border-outline px-10 py-4 justify-between">
            <div className="flex basis-1/4 flex-col gap-y-2 items-center">
              <span className="text-foreground-1 text-sm">TVL</span>
              <span>
                {state.operator?.strategies &&
                  `${assetFormatter.format(formatEther(state.operatorTVL.toString()))} ETH`}
              </span>
            </div>
            <Divider orientation="vertical" className="bg-outline" />
            <div className="flex basis-1/6 flex-col items-center gap-y-2">
              <span className="text-foreground-1 text-sm">AVS Subscribed</span>
              <span>{state.operator?.avs.length}</span>
            </div>
            <Divider orientation="vertical" className="bg-outline" />
            <div className="flex basis-2/12 flex-col gap-y-2 items-center">
              <span className="text-foreground-1 text-sm">Stakers</span>
              <span>{state.operator?.stakerCount}</span>
            </div>
            <Divider orientation="vertical" className="bg-outline" />
            <div className="flex basis-1/12 flex-col gap-y-2 items-center">
              <span className="text-foreground-1 text-sm">Uptime</span>
              <span>TODO</span>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card radius="md" className="bg-content1 border border-outline p-4">
        <CardHeader className="flex flex-wrap justify-between gap-3">
          <div className="space-y-2 block">
            <div className="font-light text-lg text-foreground-1">TVL</div>
            <div className="font-light">
              <div className="text-base ">
                <span>4,554,567 ETH</span>
              </div>
              <div className="text-xs text-success">13,444,543.123 USD</div>
            </div>
          </div>
          <GraphTimelineSelector
            timelineTab={'7days'}
            onTimelineChange={handleTimelineChange}
          />
        </CardHeader>
        <CardBody className="w-full">
          <TVLOverTime />
        </CardBody>
      </Card>

      <div className="flex gap-x-4 w-full">
        <Card
          radius="md"
          className="bg-content1 w-full border border-outline p-0"
        >
          <CardHeader className="m-4">
            <span className="text-foreground-2">Restaking Leaderboard</span>
          </CardHeader>
          <CardBody>
            <RestakingLeaderboard />
          </CardBody>
        </Card>
        <div className="w-full flex flex-col gap-y-4">
          <Card
            radius="md"
            className="bg-content1 w-full border border-outline p-4"
          >
            <CardHeader className="flex flex-wrap justify-between gap-3">
              <div className="space-y-2 block">
                <span className="text-foreground-2">Restaker Trend</span>
                <div className="font-light">
                  <div className="text-base text-foreground-1">
                    <span>4,554,567 ETH</span>
                  </div>
                </div>
              </div>
              <GraphTimelineSelector
                timelineTab={'7days'}
                onTimelineChange={handleTimelineChange}
              />
            </CardHeader>
            <CardBody>
              <RestakerTrend width={670} height={400} />
            </CardBody>
          </Card>
          <Card
            radius="md"
            className="bg-content1 w-full border border-outline p-4"
          >
            <CardHeader>
              <span className="text-foreground-2">LST Distribution</span>
            </CardHeader>
            <CardBody>
              <LSTDistribution
                strategies={state.operator?.strategies}
                operatorTVL={state.operatorTVL}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OperatorDetails;
