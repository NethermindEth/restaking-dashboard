import { SupportedNetwork } from "@/app/utils";
import { ApiDepositsResponse, getDeposits } from "@/app/utils/api/deposits";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

export function useDeposits(network: SupportedNetwork): UseQueryResult<ApiDepositsResponse> {
  const result = useQuery({
    queryKey: ["deposits", network],
    queryFn: async (): Promise<ApiDepositsResponse> => {
      const { data } = await getDeposits(network);

      return data;
    },
    retry: false,
  });

  return result;
}
