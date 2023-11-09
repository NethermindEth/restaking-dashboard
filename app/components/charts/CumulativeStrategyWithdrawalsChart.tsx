"use client";

import { SupportedNetwork, SupportedToken, TimeRange, Timeline } from "@/app/utils/types";
import useWithdrawals from "@/app/components/hooks/useWithdrawals";
import LineChart from "@/app/components/charts/base/LineChart";
import { getNetworkStrategyTokens } from "@/app/utils/constants";
import useWithdrawalsGrouping from "@/app/components/hooks/useWithdrawalsGrouping";

export interface CumulativeStrategyWithdrawalsChartProps {
  network: SupportedNetwork;
  timeline: Timeline;
  timeRange: TimeRange;
}

export default function CumulativeStrategyWithdrawalsChart({ network, timeRange, timeline }: CumulativeStrategyWithdrawalsChartProps) {
  const { data: rawWithdrawalsData, isLoading: rawWithdrawalsLoading } = useWithdrawals(network, timeline);
  const { data: withdrawalsData } = useWithdrawalsGrouping(rawWithdrawalsData, timeRange)
  
  const networkStrategyTokens = getNetworkStrategyTokens(network);

  if (!withdrawalsData || !rawWithdrawalsData || rawWithdrawalsLoading) {
    return (
      <div className="w-full mx-auto loading-pulse">
        <LineChart
          title="Cumulative Token Withdrawals"
          amounts={networkStrategyTokens.map(() => [])}
          timestamps={[]}
          tokens={networkStrategyTokens}
        />
      </div>
    )
  }

  return (
    <LineChart
      title="Cumulative Token Withdrawals"
      amounts={networkStrategyTokens.map((token) => withdrawalsData.withdrawals[token as SupportedToken]!.map(el => el.cumulativeAmount.toFixed(2)))}
      timestamps={withdrawalsData?.timestamps}
      tokens={networkStrategyTokens}
    />
  );
}
