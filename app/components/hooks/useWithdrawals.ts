import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { SupportedNetwork, Timeline } from "@/app/utils/types";
import { ApiWithdrawalsResponse, getWithdrawals } from "@/app/utils/api/withdrawals";

export function getWithdrawalsQueryKey(network: SupportedNetwork, timeline: Timeline): any[] {
  return ["withdrawals", network, timeline];
}

export async function queryWithdrawals(network: SupportedNetwork, timeline: Timeline, _: boolean = false): Promise<ApiWithdrawalsResponse> {
  return await getWithdrawals(network, timeline);
}

export function useWithdrawals(network: SupportedNetwork, timeline: Timeline): UseQueryResult<ApiWithdrawalsResponse> {
  const result = useQuery({
    queryKey: getWithdrawalsQueryKey(network, timeline),
    queryFn: () => queryWithdrawals(network, timeline),
    retry: false,
  });

  return result;
}
