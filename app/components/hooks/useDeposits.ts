import { SupportedNetwork } from "@/app/utils";
import { ApiDepositsResponse, getDeposits } from "@/app/utils/api/deposits";
import { UseQueryResult, useQuery } from "react-query";

export function useDeposits(network: SupportedNetwork): UseQueryResult<ApiDepositsResponse> {
  const result = useQuery(["deposits", network], async (): Promise<ApiDepositsResponse> => {
    const { data } = await getDeposits(network);

    return data;
  });

  return result;
}
