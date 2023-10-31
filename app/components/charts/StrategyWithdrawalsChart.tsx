"use client";

import { SupportedNetwork, SupportedToken } from "@/app/utils/types";
import { getNetworkStrategyTokens } from "@/app/utils/constants";
import { useWithdrawals } from "@/app/components/hooks/useWithdrawals";
import StackedBarChart from "@/app/components/charts/base/StackedBarChart";

export interface StrategyWithdrawalsChartProps {
  network: SupportedNetwork;
}

export default function StrategyWithdrawalsChart({ network }: StrategyWithdrawalsChartProps) {
  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useWithdrawals(network);
  
  const networkStrategyTokens = getNetworkStrategyTokens(network);

  if (!withdrawalsData || withdrawalsLoading) {
    return (
      <div className="w-full mx-auto loading-pulse">
        <StackedBarChart
          title="EigenPod deposits by day"
          amounts={networkStrategyTokens.map(() => [])}
          timestamps={[]}
          tokens={networkStrategyTokens}
        />
      </div>
    )
  }

  return (
    <StackedBarChart
      title="Withdrawn tokens by day"
      amounts={networkStrategyTokens.map((token) => withdrawalsData.withdrawals[token as SupportedToken]!.map(el => el.totalAmount.toFixed(2)))}
      timestamps={withdrawalsData?.timestamps}
      tokens={networkStrategyTokens}
    />
  );
}
