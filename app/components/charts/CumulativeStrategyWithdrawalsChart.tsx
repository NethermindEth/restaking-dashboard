"use client";

import { SupportedNetwork, SupportedToken, TimeRange, Timeline } from "@/app/utils/types";
import { useWithdrawals } from "@/app/components/hooks/useWithdrawals";
import LineChart from "@/app/components/charts/base/LineChart";
import { getNetworkStrategyTokens } from "@/app/utils/constants";

export interface CumulativeStrategyWithdrawalsChartProps {
  network: SupportedNetwork;
  timeline: Timeline;
  timeRange: TimeRange;
}

export default function CumulativeStrategyWithdrawalsChart({ network, timeRange, timeline }: CumulativeStrategyWithdrawalsChartProps) {
  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useWithdrawals(network, timeRange, timeline);
  
  const networkStrategyTokens = getNetworkStrategyTokens(network);

  if (!withdrawalsData || withdrawalsLoading) {
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
