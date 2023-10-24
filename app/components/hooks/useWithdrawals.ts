import { SupportedNetwork } from "@/app/utils";
import { ApiWithdrawalsResponse, getWithdrawals } from "@/app/utils/api/withdrawals";
import { UseQueryResult, useQuery } from "react-query";

export function useWithdrawals(network: SupportedNetwork): UseQueryResult<ApiWithdrawalsResponse> {
  const result = useQuery(["withdrawals", network], async (): Promise<ApiWithdrawalsResponse> => {
    const { data } = await getWithdrawals(network);

    return data;
  });

  return result;
}