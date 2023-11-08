"use client";

import { SupportedNetwork, SupportedToken, TimeRange, Timeline } from "@/app/utils/types";
import { getNetworkStrategyTokens } from "@/app/utils/constants";
import { useDeposits } from "@/app/components/hooks/useDeposits";
import StackedBarChart from "@/app/components/charts/base/StackedBarChart";

export interface StrategyDepositsChartProps {
  network: SupportedNetwork;
  timeline: Timeline;
  timeRange: TimeRange;
}

export default function StrategyDepositsChart({ network, timeRange, timeline }: StrategyDepositsChartProps) {
  const { data: depositsData, isLoading: depositsLoading } = useDeposits(network, timeRange, timeline);
  
  const networkStrategyTokens = getNetworkStrategyTokens(network);

  if (!depositsData || depositsLoading) {
    return (
      <div className="w-full mx-auto loading-pulse">
        <StackedBarChart
          title="Token deposits"
          amounts={networkStrategyTokens.map(() => [])}
          timestamps={[]}
          tokens={networkStrategyTokens}
        />
      </div>
    )
  }

  return (
    <StackedBarChart
      title="Token deposits"
      amounts={networkStrategyTokens.map((token) => depositsData.deposits[token as SupportedToken]!.map(el => el.totalAmount.toFixed(2)))}
      timestamps={depositsData?.timestamps}
      tokens={networkStrategyTokens}
    />
  );
}
