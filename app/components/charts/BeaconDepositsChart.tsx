"use client";

import { SupportedNetwork, SupportedTimeRange, SupportedTimeline } from "@/app/utils/types";
import useDeposits from "@/app/components/hooks/useDeposits";
import StackedBarChart from "@/app/components/charts/base/StackedBarChart";
import useDepositsGrouping from "@/app/components/hooks/useDepositsGrouping";

export interface BeaconDepositsChartProps {
  network: SupportedNetwork;
  timeRange: SupportedTimeRange;
  timeline: SupportedTimeline;
}

export default function BeaconDepositsChart({ network, timeRange, timeline }: BeaconDepositsChartProps) {
  const { data: rawDepositsData, isLoading: rawDepositsLoading } = useDeposits(network, timeline);
  const { data: depositsData } = useDepositsGrouping(rawDepositsData, timeRange)

  if (!depositsData || !rawDepositsData || rawDepositsLoading) {
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
      amounts={[(depositsData.deposits["beacon"] ?? []).map(el => el.totalAmount.toFixed(2))]}
      timestamps={depositsData?.timestamps}
      tokens={["beacon"]}
    />
  );
}
