import { SupportedNetwork } from "@/app/utils";
import { ApiWithdrawalsResponse, getWithdrawals } from "@/app/utils/api/withdrawals";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

export function useWithdrawals(network: SupportedNetwork): UseQueryResult<ApiWithdrawalsResponse> {
  const result = useQuery({
    queryKey: ["withdrawals", network],
    queryFn: async (): Promise<ApiWithdrawalsResponse> => {
      const { data } = await getWithdrawals(network);

      return data;
    },
    retry: false,
  });

  return result;
}