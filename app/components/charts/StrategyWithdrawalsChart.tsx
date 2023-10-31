"use client";

import { SupportedNetwork, SupportedToken } from "@/app/utils/types";
import { getNetworkStrategyTokens } from "@/app/utils/constants";
import { useWithdrawals } from "@/app/components/hooks/useWithdrawals";
import StackedBarChart from "@/app/components/charts/base/StackedBarChart";

export interface StrategyWithdrawalsChartProps {
  network: SupportedNetwork;
}

export default function StrategyWithdrawalsChart({ network }: StrategyWithdrawalsChartProps) {
  const { data: withdrawalsData, error: withdrawalsError, isLoading: withdrawalsLoading } = useWithdrawals(network);
  
  const networkStrategyTokens = getNetworkStrategyTokens(network);

  if (!withdrawalsData) {
    return <></>
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
