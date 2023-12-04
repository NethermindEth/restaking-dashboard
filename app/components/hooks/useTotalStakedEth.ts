import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { SupportedNetwork, TokenRecord } from "@/app/utils/types";
import { ShareRates, useShareRatesEth } from "./useShareRates";
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

  return {
    stEth: totalStakedTokens.stEth ? totalStakedTokens.stEth * rates.stEth! : null,
    rEth: totalStakedTokens.rEth ? totalStakedTokens.rEth * rates.rEth! : null,
    cbEth: totalStakedTokens.cbEth ? totalStakedTokens.cbEth * rates.cbEth! : null,
    beacon: totalStakedTokens.beacon,
  };
}

export function useTotalStakedEth(network: SupportedNetwork): UseQueryResult<TokenRecord<number | null>> {
  const { data: rates } = useShareRatesEth(network);
  const { data: totalStakedTokens } = useTotalStakedTokens(network);

  const result = useQuery({
    queryKey: ["totalStakedEth", network, rates, totalStakedTokens],
    queryFn: () => queryTotalStakedEth(rates!, totalStakedTokens!),
    enabled: !!rates && !!totalStakedTokens,
    retry: false,
  });

  return result;
}
  