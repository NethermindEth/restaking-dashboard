import { QueryClient, UseQueryResult, useQuery } from "@tanstack/react-query";

import { SupportedNetwork, TokenRecord, supportedTokens } from "@/app/utils/types";
import { ShareRates, prefetchingGetShareRatesQueryKey, useShareRates } from "./useShareRates";
import { getLeaderboard } from "@/app/utils/api/leaderboard";
import { MAX_LEADERBOARD_SIZE } from "@/app/utils/constants";

export interface LeaderboardStaker {
  depositor: `0x${string}`;
  totalEth: number;
}

export interface LeaderboardData {
  partial: TokenRecord<LeaderboardStaker[] | null>;
  total: LeaderboardStaker[];
}

export function getLeaderboardQueryKey(network: SupportedNetwork, rates?: ShareRates): any[] {
  return ["leaderboard", network, rates];
}

export function prefetchingGetLeaderboardQueryKey(network: SupportedNetwork, queryClient: QueryClient): any[] {
  const rates: ShareRates | undefined = queryClient.getQueryData(prefetchingGetShareRatesQueryKey(network, queryClient));

  if (!rates) throw new Error("Rates were not yet fetched");

  return getLeaderboardQueryKey(network, rates);
}

export async function queryLeaderboard(network: SupportedNetwork, rates: ShareRates, isPrefetch: boolean = false): Promise<LeaderboardData> {
  if (!rates) throw new Error("Rates were not yet fetched");

  const result = await getLeaderboard(network, (isPrefetch)? { next: { revalidate: Infinity } } : undefined);
  const partial = {} as TokenRecord<LeaderboardStaker[] | null>;

  supportedTokens.forEach(token => {
    const leaderboard = result.leaderboard[token];

    partial[token] = leaderboard
      ? leaderboard.map(el => ({
        depositor: el.depositor,
        totalEth: el.totalShares * rates[token]!,
      }))
      : null;
  });

  const total = Object.values(
    Object.values(partial).flat().reduce((acc, el) => {
      if (!el) return acc;

      if (!acc[el.depositor]) acc[el.depositor] = { depositor: el.depositor, totalEth: 0 };
      acc[el.depositor].totalEth += el.totalEth;

      return acc;
    }, {} as Record<string, LeaderboardStaker>)
  ).sort((a, b) => b.totalEth - a.totalEth).slice(0, MAX_LEADERBOARD_SIZE);

  return {
    partial,
    total,
  };
}

export async function prefetchingQueryLeaderboard(network: SupportedNetwork, queryClient: QueryClient): Promise<LeaderboardData> {
  const rates: ShareRates | undefined = queryClient.getQueryData(prefetchingGetShareRatesQueryKey(network, queryClient));

  if (!rates) throw new Error("Rates were not yet fetched");

  return await queryLeaderboard(network, rates, true);
}

export function useLeaderboard(network: SupportedNetwork): UseQueryResult<LeaderboardData> {
  const { data: rates } = useShareRates(network);

  const result = useQuery({
    queryKey: getLeaderboardQueryKey(network, rates),
    queryFn: () => queryLeaderboard(network, rates!),
    enabled: !!rates,
    retry: false,
  });

  return result;
}