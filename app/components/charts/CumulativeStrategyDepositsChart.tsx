"use client";

import { SupportedNetwork, SupportedToken, SupportedTimeRange, SupportedTimeline } from "@/app/utils/types";
import { getNetworkStrategyTokens } from "@/app/utils/constants";
import useDeposits from "@/app/components/hooks/useDeposits";
import LineChart from "@/app/components/charts/base/LineChart";
import useDepositsGrouping from "@/app/components/hooks/useDepositsGrouping";

export interface CumulativeStrategyDepositsChartProps {
  network: SupportedNetwork;
  timeline: SupportedTimeline;
  timeRange: SupportedTimeRange;
}

export default function CumulativeStrategyDepositsChart({ network, timeRange, timeline }: CumulativeStrategyDepositsChartProps) {
  const { data: rawDepositsData, isLoading: rawDepositsLoading } = useDeposits(network, timeline);
  const { data: depositsData } = useDepositsGrouping(rawDepositsData, timeRange)
  
  const networkStrategyTokens = getNetworkStrategyTokens(network);

  if (!depositsData || !rawDepositsData || rawDepositsLoading) {
    return (
      <div className="w-full mx-auto loading-pulse">
        <LineChart
          title="Cumulative Token Deposits"
          amounts={networkStrategyTokens.map(() => [])}
          timestamps={[]}
          tokens={networkStrategyTokens}
        />
      </div>
    )
  }

  return (
    <LineChart
      title="Cumulative Token Deposits"
      amounts={networkStrategyTokens.map((token) => (depositsData.deposits[token as SupportedToken] ?? []).map(el => el.cumulativeAmount.toFixed(2)))}
      timestamps={depositsData?.timestamps}
      tokens={networkStrategyTokens}
    />
  );
}
