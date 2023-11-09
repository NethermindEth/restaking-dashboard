"use client";

import { SupportedNetwork, TimeRange, Timeline } from "@/app/utils/types";
import { useDeposits } from "@/app/components/hooks/useDeposits";
import StackedBarChart from "@/app/components/charts/base/StackedBarChart";
import { useDepositsGrouping } from "@/app/components/hooks/useDepositsGrouping";

export interface BeaconDepositsChartProps {
  network: SupportedNetwork;
  timeRange: TimeRange;
  timeline: Timeline;
}

export default function BeaconDepositsChart({ network, timeRange, timeline }: BeaconDepositsChartProps) {
  const { data: rawDepositsData, isLoading: rawDepositsLoading } = useDeposits(network, timeline);
  const { data: depositsData, isLoading: depositsLoading } = useDepositsGrouping(rawDepositsData, timeRange)

  if (!depositsData || !rawDepositsData || depositsLoading || rawDepositsLoading) {
    return (
      <div className="w-full mx-auto loading-pulse">
        <StackedBarChart
          title="EigenPod deposits"
          amounts={[[]]}
          timestamps={[]}
          tokens={["beacon"]}
        />
      </div>
    )
  }

  return (
    <StackedBarChart
      title="EigenPod deposits"
      amounts={[depositsData.deposits["beacon"]!.map(el => el.totalAmount.toFixed(2))]}
      timestamps={depositsData?.timestamps}
      tokens={["beacon"]}
    />
  );
}
