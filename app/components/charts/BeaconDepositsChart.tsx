"use client";

import { SupportedNetwork } from "@/app/utils/types";
import { useDeposits } from "@/app/components/hooks/useDeposits";
import StackedBarChart from "@/app/components/charts/base/StackedBarChart";

export interface BeaconDepositsChartProps {
  network: SupportedNetwork;
}

export default function BeaconDepositsChart({ network }: BeaconDepositsChartProps) {
  const { data: depositsData, error: depositsError, isLoading: depositsLoading } = useDeposits(network);

  if (!depositsData) {
    return <></>
  }

  return (
    <StackedBarChart
      title="EigenPod deposits by day"
      amounts={[depositsData.deposits["beacon"]!.map(el => el.totalAmount.toFixed(2))]}
      timestamps={depositsData?.timestamps}
      tokens={["beacon"]}
    />
  );
}
