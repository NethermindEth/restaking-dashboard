import { QueryClient, UseQueryResult, useQuery } from "@tanstack/react-query";

import { SupportedNetwork } from "@/app/utils/types";
import { ApiDepositsResponse, getDeposits } from "@/app/utils/api/deposits";

export function getDepositsQueryKey(network: SupportedNetwork): any[] {
  return ["deposits", network];
}

export function prefetchingGetDepositsQueryKey(network: SupportedNetwork, _: QueryClient): any[] {
  return getDepositsQueryKey(network);
}

export async function queryDeposits(network: SupportedNetwork): Promise<ApiDepositsResponse> {
  const { data } = await getDeposits(network);

  return data;
}

export async function prefetchingQueryDeposits(network: SupportedNetwork, _: QueryClient): Promise<ApiDepositsResponse> {
  return await queryDeposits(network);
}

export function useDeposits(network: SupportedNetwork): UseQueryResult<ApiDepositsResponse> {
  const result = useQuery({
    queryKey: getDepositsQueryKey(network),
    queryFn: () => queryDeposits(network),
    retry: false,
  });

  return result;
}
