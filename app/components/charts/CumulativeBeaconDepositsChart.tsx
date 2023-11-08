"use client";

import { SupportedNetwork, TimeRange, Timeline } from "@/app/utils/types";
import { useDeposits } from "@/app/components/hooks/useDeposits";
import LineChart from "@/app/components/charts/base/LineChart";

export interface BeaconDepositsChartProps {
  network: SupportedNetwork;
  timeRange: TimeRange;
  timeline: Timeline;
}

export default function CumulativeBeaconDepositsChart({ network, timeRange, timeline }: BeaconDepositsChartProps) {
  const { data: depositsData, isLoading: depositsLoading } = useDeposits(network, timeRange, timeline);

  if (!depositsData || depositsLoading) {
    return (
      <div className="w-full mx-auto loading-pulse">
        <LineChart
          title="Cumulative EigenPod deposits"
          amounts={[[]]}
          timestamps={[]}
          tokens={["beacon"]}
        />
      </div>
    )
  }

  return (
    <LineChart
      title="Cumulative EigenPod deposits"
      amounts={[depositsData.deposits["beacon"]!.map(el => el.cumulativeAmount.toFixed(2))]}
      timestamps={depositsData?.timestamps}
      tokens={["beacon"]}
    />
  );
}
