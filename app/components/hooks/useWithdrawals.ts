import { QueryClient, UseQueryResult, useQuery } from "@tanstack/react-query";

import { SupportedNetwork } from "@/app/utils/types";
import { ApiWithdrawalsResponse, getWithdrawals } from "@/app/utils/api/withdrawals";

export function getWithdrawalsQueryKey(network: SupportedNetwork): any[] {
  return ["withdrawals", network];
}

export function prefetchingGetWithdrawalsQueryKey(network: SupportedNetwork, _: QueryClient): any[] {
  return getWithdrawalsQueryKey(network);
}

export async function queryWithdrawals(network: SupportedNetwork, _: boolean = false): Promise<ApiWithdrawalsResponse> {
  return await getWithdrawals(network);
}

export async function prefetchingQueryWithdrawals(network: SupportedNetwork, _: QueryClient): Promise<ApiWithdrawalsResponse> {
  return await queryWithdrawals(network, true);
}

export function useWithdrawals(network: SupportedNetwork): UseQueryResult<ApiWithdrawalsResponse> {
  const result = useQuery({
    queryKey: getWithdrawalsQueryKey(network),
    queryFn: () => queryWithdrawals(network),
    retry: false,
  });

  return result;
}
