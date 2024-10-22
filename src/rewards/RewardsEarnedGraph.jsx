import React, { useEffect, useRef } from 'react';
import { Spinner } from '@nextui-org/react';
import { useMutativeReducer } from 'use-mutative';
import {
  handleServiceError,
  reduceState
} from '../shared/helpers';
import { useServices } from '../@services/ServiceContext';
import RewardsEarnedLineChart from '../home/charts/RewardsEarnedLineChart';
import ErrorMessage from '../shared/ErrorMessage';

export const RewardsEarnedGraph = ({ ethRate, address }) => {
  const { rewardService } = useServices();
  const abortController = useRef(null);
  const [state, dispatch] = useMutativeReducer(reduceState, {
    error: undefined,
    isChartLoading: true,
    points: [],
    useRate: true
  });

  useEffect(() => {
    let isSubscribed = true;

    const fetchData = async () => {
      dispatch({ error: undefined, isChartLoading: true });
      try {
        if (abortController.current) {
          abortController.current.abort();
        }
        abortController.current = new AbortController();

        const response = await rewardService.getOperatorAllRewards(
          address,
          true,
          abortController.current.signal
        );

        if (isSubscribed && response?.results) {
          dispatch({
            isChartLoading: false,
            points: response.results
          });
        }

        abortController.current = null;
      } catch (e) {
        if (isSubscribed) {
          dispatch({
            error: handleServiceError(e),
            isChartLoading: false
          });
        }
      }
    };

    fetchData();

    return () => {
      isSubscribed = false;
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [address, rewardService, dispatch]);

  if (state.isChartLoading) {
    return (
      <div className="rd-box flex h-[512px] w-full items-center justify-center p-4">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="rd-box flex h-[512px] w-full items-center justify-center p-4">
        <ErrorMessage message="Failed loading EigenLayer TVL" />
      </div>
    );
  }

  if (!state.points?.length) {
    return (
      <div className="rd-box flex h-[512px] w-full items-center justify-center p-4">
        <h2>No data available!</h2>
      </div>
    )
  }

  return (
    <RewardsEarnedLineChart
      rewardsData={state.points}
      height={512}
      ethRate={ethRate}
    />
  );
}