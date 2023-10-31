"use client";

import { SupportedNetwork, SupportedToken } from "@/app/utils/types";
import { getNetworkStrategyTokens } from "@/app/utils/constants";
import { useDeposits } from "@/app/components/hooks/useDeposits";
import LineChart from "@/app/components/charts/base/LineChart";

export interface CumulativeStrategyDepositsChartProps {
  network: SupportedNetwork;
}

export default function CumulativeStrategyDepositsChart({ network }: CumulativeStrategyDepositsChartProps) {
  const { data: depositsData, isLoading: depositsLoading } = useDeposits(network);
  
  const networkStrategyTokens = getNetworkStrategyTokens(network);

  if (!depositsData || depositsLoading) {
    return (
      <div className="w-full mx-auto loading-pulse">
        <LineChart
          title="EigenPod deposits by day"
          amounts={networkStrategyTokens.map(() => [])}
          timestamps={[]}
          tokens={networkStrategyTokens}
        />
      </div>
    )
  }

  return (
    <LineChart
      title="Cumulative deposited tokens by day"
      amounts={networkStrategyTokens.map((token) => depositsData.deposits[token as SupportedToken]!.map(el => el.cumulativeAmount.toFixed(2)))}
      timestamps={depositsData?.timestamps}
      tokens={networkStrategyTokens}
    />
  );
}
