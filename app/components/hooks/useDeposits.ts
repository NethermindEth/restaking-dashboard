import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { SupportedNetwork, TimeRange, Timeline } from "@/app/utils/types";
import { ApiDepositsResponse, getDeposits } from "@/app/utils/api/deposits";

export function getDepositsQueryKey(network: SupportedNetwork, timeRange: TimeRange, timeline: Timeline): any[] {
  return ["deposits", network, timeRange, timeline];
}

export async function queryDeposits(network: SupportedNetwork, timeRange: TimeRange, timeline: Timeline, _: boolean = false): Promise<ApiDepositsResponse> {
  return await getDeposits(network, timeRange, timeline);
}

export function useDeposits(network: SupportedNetwork, timeRange: TimeRange, timeline: Timeline): UseQueryResult<ApiDepositsResponse> {
  const result = useQuery({
    queryKey: getDepositsQueryKey(network, timeRange, timeline),
    queryFn: () => queryDeposits(network, timeRange, timeline),
    retry: false,
  });

  return result;
}
