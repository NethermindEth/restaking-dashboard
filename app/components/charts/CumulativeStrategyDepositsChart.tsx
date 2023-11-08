"use client";

import { SupportedNetwork, SupportedToken, TimeRange, Timeline } from "@/app/utils/types";
import { getNetworkStrategyTokens } from "@/app/utils/constants";
import { useDeposits } from "@/app/components/hooks/useDeposits";
import LineChart from "@/app/components/charts/base/LineChart";

export interface CumulativeStrategyDepositsChartProps {
  network: SupportedNetwork;
  timeline: Timeline;
  timeRange: TimeRange;
}

export default function CumulativeStrategyDepositsChart({ network, timeRange, timeline }: CumulativeStrategyDepositsChartProps) {
  const { data: depositsData, isLoading: depositsLoading } = useDeposits(network, timeRange, timeline);
  
  const networkStrategyTokens = getNetworkStrategyTokens(network);

  if (!depositsData || depositsLoading) {
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
      amounts={networkStrategyTokens.map((token) => depositsData.deposits[token as SupportedToken]!.map(el => el.cumulativeAmount.toFixed(2)))}
      timestamps={depositsData?.timestamps}
      tokens={networkStrategyTokens}
    />
  );
}
