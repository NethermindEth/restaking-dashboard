"use client";

import { SupportedNetwork, SupportedToken } from "@/app/utils/types";
import { getNetworkStrategyTokens } from "@/app/utils/constants";
import { useDeposits } from "@/app/components/hooks/useDeposits";
import StackedBarChart from "@/app/components/charts/base/StackedBarChart";

export interface StrategyDepositsChartProps {
  network: SupportedNetwork;
}

export default function StrategyDepositsChart({ network }: StrategyDepositsChartProps) {
  const { data: depositsData, error: depositsError, isLoading: depositsLoading } = useDeposits(network);
  
  const networkStrategyTokens = getNetworkStrategyTokens(network);

  if (!depositsData) {
    return <></>
  }

  return (
    <StackedBarChart
      title="Token deposits by day"
      amounts={networkStrategyTokens.map((token) => depositsData.deposits[token as SupportedToken]!.map(el => el.totalAmount.toFixed(2)))}
      timestamps={depositsData?.timestamps}
      tokens={networkStrategyTokens}
    />
  );
}
