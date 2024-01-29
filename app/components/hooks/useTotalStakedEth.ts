import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { SupportedNetwork, TokenRecord, supportedTokens } from "@/app/utils/types";
import { ShareRates, useShareRates } from "./useShareRates";
import { useTotalStakedTokens } from "./useTotalStakedTokens";

export function getTotalStakedEthQueryKey(
  network: SupportedNetwork,
  rates: ShareRates,
  totalStakedTokens: TokenRecord<number | null>,
): any[] {
  return ["totalStakedEth", network, rates, totalStakedTokens];
}

export async function queryTotalStakedEth(
  rates: ShareRates,
  totalStakedTokens: TokenRecord<number | null>,
  _: boolean = false,
): Promise<TokenRecord<number | null>> {
  if (!rates) throw new Error("Rates were not yet fetched");
  if (!totalStakedTokens) throw new Error("Total staked tokens were not yet fetched");

  return Object.fromEntries(
    supportedTokens.map(token => ([token, (totalStakedTokens[token] == null) ? totalStakedTokens[token]! * rates[token]! : null]))
  ) as TokenRecord<number | null>;
}

export function useTotalStakedEth(network: SupportedNetwork): UseQueryResult<TokenRecord<number | null>> {
  const { data: rates } = useShareRates(network);
  const { data: totalStakedTokens } = useTotalStakedTokens(network);

  const result = useQuery({
    queryKey: ["totalStakedEth", network, rates, totalStakedTokens],
    queryFn: () => queryTotalStakedEth(rates!, totalStakedTokens!),
    enabled: !!rates && !!totalStakedTokens,
    retry: false,
  });

  return result;
}
  