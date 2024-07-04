import { Card, CardBody, CardHeader, Divider } from '@nextui-org/react';
import React, { useEffect } from 'react';
import OperatorTVLOverTime from './OperatorTVLOverTime';
import RestakingLeaderboard from './RestakingLeaderboard';
import { useParams } from 'react-router-dom';
import { useServices } from '../@services/ServiceContext';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';
import { formatEther } from 'ethers';
import LSTDistribution from './LSTDistribution';
import RestakersTrend from './RestakersTrend';

const OperatorDetails = () => {
  const { address } = useParams();
  const { operatorService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    operatorTVL: 0,
    timelineTab: '7days'
  });

  const calculateTVL = strategies => {
    const tvl = strategies.reduce((acc, s) => {
      if (s.address === '0xacb55c530acdb2849e6d4f36992cd8c9d50ed8f7') {
        return acc;
      }
      return (acc += BigInt(s.tokens));
    }, 0n);
    return tvl;
  };

  const getOperator = async () => {
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
    getOperator();
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
              <span className="text-default-2 text-sm">TVL</span>
              <span className="text-foreground-active">
                {state.operator?.strategies &&
                  `${assetFormatter.format(formatEther(state.operatorTVL.toString()))} ETH`}
              </span>
            </div>
            <Divider orientation="vertical" className="bg-outline" />
            <div className="flex basis-1/6 flex-col items-center gap-y-2">
              <span className="text-default-2 text-sm">AVS Subscribed</span>
              <span className="text-foreground-active">
                {state.operator?.avs.length}
              </span>
            </div>
            <Divider orientation="vertical" className="bg-outline" />
            <div className="flex basis-2/12 flex-col gap-y-2 items-center">
              <span className="text-default-2 text-sm">Restakers</span>
              <span className="text-foreground-active">
                {state.operator?.stakerCount}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      <OperatorTVLOverTime
        opAddress={address}
        currentTVL={assetFormatter.format(
          formatEther(state.operatorTVL.toString())
        )}
      />

      <div className="flex flex-col lg:flex-row gap-4 w-full">
        <div className="w-full flex flex-col gap-y-4">
          <RestakersTrend opAddress={address} />
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
