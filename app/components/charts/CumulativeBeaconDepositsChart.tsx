"use client";

import { SupportedNetwork } from "@/app/utils/types";
import { useDeposits } from "@/app/components/hooks/useDeposits";
import LineChart from "@/app/components/charts/base/LineChart";

export interface BeaconDepositsChartProps {
  network: SupportedNetwork;
}

export default function CumulativeBeaconDepositsChart({ network }: BeaconDepositsChartProps) {
  const { data: depositsData, isLoading: depositsLoading } = useDeposits(network);

  if (!depositsData || depositsLoading) {
    return (
      <div className="w-full mx-auto loading-pulse">
        <LineChart
          title="EigenPod deposits by day"
          amounts={[[]]}
          timestamps={[]}
          tokens={["beacon"]}
        />
      </div>
    )
  }

  return (
    <LineChart
      title="Cumulative EigenPod deposits by day"
      amounts={[depositsData.deposits["beacon"]!.map(el => el.cumulativeAmount.toFixed(2))]}
      timestamps={depositsData?.timestamps}
      tokens={["beacon"]}
    />
  );
}
