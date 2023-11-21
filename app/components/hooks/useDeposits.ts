import { QueryClient, UseQueryResult, useQuery } from "@tanstack/react-query";

import { SupportedNetwork } from "@/app/utils/types";
import { ApiDepositsResponse, getDeposits } from "@/app/utils/api/deposits";

export function getDepositsQueryKey(network: SupportedNetwork): any[] {
  return ["deposits", network];
}

export async function queryDeposits(network: SupportedNetwork, _: boolean = false): Promise<ApiDepositsResponse> {
  return await getDeposits(network);
}

export function useDeposits(network: SupportedNetwork): UseQueryResult<ApiDepositsResponse> {
  const result = useQuery({
    queryKey: getDepositsQueryKey(network),
    queryFn: () => queryDeposits(network),
    retry: false,
  });

  return result;
}
