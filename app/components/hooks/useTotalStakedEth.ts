import { QueryClient, UseQueryResult, useQuery } from "@tanstack/react-query";

import { SupportedNetwork, TokenRecord } from "@/app/utils/types";
import { ShareRates, prefetchingGetShareRatesQueryKey, useShareRates } from "./useShareRates";
import { useTotalStakedTokens, prefetchingGetTotalStakedTokensQueryKey } from "./useTotalStakedTokens";

export function getTotalStakedEthQueryKey(network: SupportedNetwork, rates: ShareRates, totalStakedTokens: TokenRecord<number | null>): any[] {
  return ["totalStakedEth", network, rates, totalStakedTokens];
}

export function prefetchingGetTotalStakedEthQueryKey(network: SupportedNetwork, queryClient: QueryClient): any[] {
  const rates: ShareRates | undefined = queryClient.getQueryData(prefetchingGetShareRatesQueryKey(network, queryClient));
  if (!rates) throw new Error("Rates were not yet fetched");

  const totalStakedTokens: TokenRecord<number | null> | undefined = queryClient.getQueryData(prefetchingGetTotalStakedTokensQueryKey(network, queryClient));
  if (!totalStakedTokens) throw new Error("Rates were not yet fetched");

  return getTotalStakedEthQueryKey(network, rates, totalStakedTokens);
}

export async function queryTotalStakedEth(network: SupportedNetwork, rates: ShareRates, totalStakedTokens: TokenRecord<number | null>): Promise<TokenRecord<number | null>> {
  if (!rates) throw new Error("Rates were not yet fetched");
  if (!totalStakedTokens) throw new Error("Total staked tokens were not yet fetched");

  return {
    stEth: totalStakedTokens.stEth ? totalStakedTokens.stEth * rates.stEth! : null,
    rEth: totalStakedTokens.rEth ? totalStakedTokens.rEth * rates.rEth! : null,
    cbEth: totalStakedTokens.cbEth ? totalStakedTokens.cbEth * rates.cbEth! : null,
    beacon: totalStakedTokens.beacon,
  };
}

export async function prefetchingQueryTotalStakedEth(network: SupportedNetwork, queryClient: QueryClient): Promise<TokenRecord<number | null>> {
  const rates: ShareRates | undefined = queryClient.getQueryData(prefetchingGetShareRatesQueryKey(network, queryClient));
  if (!rates) throw new Error("Rates were not yet fetched");

  const totalStakedTokens: TokenRecord<number | null> | undefined = queryClient.getQueryData(prefetchingGetTotalStakedTokensQueryKey(network, queryClient));
  if (!totalStakedTokens) throw new Error("Rates were not yet fetched");

  return await queryTotalStakedEth(network, rates, totalStakedTokens);
}

export function useTotalStakedEth(network: SupportedNetwork): UseQueryResult<TokenRecord<number | null>> {
  const { data: rates } = useShareRates(network);
  const { data: totalStakedTokens } = useTotalStakedTokens(network);

  const result = useQuery({
    queryKey: ["totalStakedEth", network, rates, totalStakedTokens],
    queryFn: () => queryTotalStakedEth(network, rates!, totalStakedTokens!),
    enabled: !!rates && !!totalStakedTokens,
    retry: false,
  });

  return result;
}
  