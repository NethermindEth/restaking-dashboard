import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { SupportedNetwork, TimeRange, Timeline } from "@/app/utils/types";
import { ApiWithdrawalsResponse, getWithdrawals } from "@/app/utils/api/withdrawals";

export function getWithdrawalsQueryKey(network: SupportedNetwork, timeRange: TimeRange, timeline: Timeline): any[] {
  return ["withdrawals", network, timeRange, timeline];
}

export async function queryWithdrawals(network: SupportedNetwork, timeRange: TimeRange, timeline: Timeline, _: boolean = false): Promise<ApiWithdrawalsResponse> {
  return await getWithdrawals(network, timeRange, timeline);
}

export function useWithdrawals(network: SupportedNetwork, timeRange: TimeRange, timeline: Timeline): UseQueryResult<ApiWithdrawalsResponse> {
  const result = useQuery({
    queryKey: getWithdrawalsQueryKey(network, timeRange, timeline),
    queryFn: () => queryWithdrawals(network, timeRange, timeline),
    retry: false,
  });

  return result;
}
