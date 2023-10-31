"use client";

import { SupportedNetwork } from "@/app/utils/types";
import { useTotalStakedEth } from "@/app/components/hooks/useTotalStakedEth";
import { getNetworkTokens } from "@/app/utils/constants";
import PieChart from "@/app/components/charts/base/PieChart";

export interface DistributionChartProps {
  network: SupportedNetwork;
}

export default function DistributionChart({ network }: DistributionChartProps) {
  const { data: totalStakedEthData, error: totalStakedEthError, isLoading: totalStakedEthLoading } = useTotalStakedEth(network);
  
  const tokens = getNetworkTokens(network);

  if (!totalStakedEthData) {
    return <></>
  }

  return (
    <PieChart
      amounts={tokens.map(token => totalStakedEthData[token]!.toFixed(2))}
      tokens={tokens}
    />
  );
}
