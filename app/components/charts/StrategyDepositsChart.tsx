"use client";

import { SupportedNetwork, SupportedToken, SupportedTimeRange, SupportedTimeline } from "@/app/utils/types";
import { getNetworkStrategyTokens } from "@/app/utils/constants";
import useDeposits from "@/app/components/hooks/useDeposits";
import StackedBarChart from "@/app/components/charts/base/StackedBarChart";
import useDepositsGrouping from "@/app/components/hooks/useDepositsGrouping";

export interface StrategyDepositsChartProps {
  network: SupportedNetwork;
  timeline: SupportedTimeline;
  timeRange: SupportedTimeRange;
}

export default function StrategyDepositsChart({ network, timeRange, timeline }: StrategyDepositsChartProps) {
  const { data: rawDepositsData, isLoading: rawDepositsLoading } = useDeposits(network, timeline);
  const { data: depositsData } = useDepositsGrouping(rawDepositsData, timeRange)
  
  const networkStrategyTokens = getNetworkStrategyTokens(network);

  if (!depositsData || !rawDepositsData || rawDepositsLoading) {
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
      amounts={networkStrategyTokens.map((token) => (depositsData.deposits[token as SupportedToken] ?? []).map(el => el.totalAmount.toFixed(2)))}
      timestamps={depositsData?.timestamps}
      tokens={networkStrategyTokens}
    />
  );
}
