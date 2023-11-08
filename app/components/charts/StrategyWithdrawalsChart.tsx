"use client";

import { SupportedNetwork, SupportedToken, TimeRange, Timeline } from "@/app/utils/types";
import { getNetworkStrategyTokens } from "@/app/utils/constants";
import { useWithdrawals } from "@/app/components/hooks/useWithdrawals";
import StackedBarChart from "@/app/components/charts/base/StackedBarChart";

export interface StrategyWithdrawalsChartProps {
  network: SupportedNetwork;
  timeline: Timeline;
  timeRange: TimeRange;
}

export default function StrategyWithdrawalsChart({ network, timeRange, timeline }: StrategyWithdrawalsChartProps) {
  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useWithdrawals(network, timeRange, timeline);
  
  const networkStrategyTokens = getNetworkStrategyTokens(network);

  if (!withdrawalsData || withdrawalsLoading) {
    return (
      <div className="w-full mx-auto loading-pulse">
        <StackedBarChart
          title="Token Withdrawals"
          amounts={networkStrategyTokens.map(() => [])}
          timestamps={[]}
          tokens={networkStrategyTokens}
        />
      </div>
    )
  }

  return (
    <StackedBarChart
      title="Token Withdrawals"
      amounts={networkStrategyTokens.map((token) => withdrawalsData.withdrawals[token as SupportedToken]!.map(el => el.totalAmount.toFixed(2)))}
      timestamps={withdrawalsData?.timestamps}
      tokens={networkStrategyTokens}
    />
  );
}
