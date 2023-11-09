import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { SupportedNetwork, Timeline } from "@/app/utils/types";
import { ApiDepositsResponse, getDeposits } from "@/app/utils/api/deposits";

export function getDepositsQueryKey(network: SupportedNetwork, timeline: Timeline): any[] {
  return ["deposits", network, timeline];
}

export async function queryDeposits(network: SupportedNetwork, timeline: Timeline, _: boolean = false): Promise<ApiDepositsResponse> {
  return await getDeposits(network, timeline);
}

export function useDeposits(network: SupportedNetwork, timeline: Timeline): UseQueryResult<ApiDepositsResponse> {
  const result = useQuery({
    queryKey: getDepositsQueryKey(network, timeline),
    queryFn: () => queryDeposits(network, timeline),
    retry: false,
  });

  return result;
}
