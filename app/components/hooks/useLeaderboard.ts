import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { SupportedNetwork, TokenRecord, supportedTokens } from "@/app/utils/types";
import { ExchangeRates, useExchangeRates } from "./useExchangeRates";
import { getLeaderboard } from "@/app/utils/api/leaderboard";
import { MAX_LEADERBOARD_SIZE } from "@/app/utils/constants";
import { StrategyShareRates, useStrategyShareRates } from "./useStrategyShareRates";

export interface LeaderboardStaker {
  depositor: `0x${string}`;
  totalTokens: number;
  totalEth: number;
}

export interface LeaderboardData {
  partial: TokenRecord<LeaderboardStaker[] | null>;
  total: LeaderboardStaker[];
}

export function getLeaderboardQueryKey(network: SupportedNetwork, exchangeRates?: ExchangeRates, strategyShareRates?: StrategyShareRates): any[] {
  return ["leaderboard", network, exchangeRates, strategyShareRates];
}

export async function queryLeaderboard(network: SupportedNetwork, exchangeRates: ExchangeRates, strategyShareRates: StrategyShareRates): Promise<LeaderboardData> {
  if (!exchangeRates) throw new Error("Exchange rates were not yet fetched");
  if (!strategyShareRates) throw new Error("Strategy share rates were not yet fetched");

  const result = await getLeaderboard(network);
  const partial = {} as TokenRecord<LeaderboardStaker[] | null>;

  supportedTokens.forEach(token => {
    const leaderboard = result.leaderboard[token];

    partial[token] = leaderboard
      ? leaderboard.map(el => ({
        depositor: el.depositor,
        totalTokens: el.totalShares * strategyShareRates[token]!,
        totalEth: el.totalShares * strategyShareRates[token]! * exchangeRates[token]!,
      }))
      : null;
  });

  const total = Object.values(
    Object.values(partial).flat().reduce((acc, el) => {
      if (!el) return acc;

      if (!acc[el.depositor]) acc[el.depositor] = { depositor: el.depositor, totalTokens: 0, totalEth: 0 };
      acc[el.depositor].totalEth += el.totalEth;
      acc[el.depositor].totalTokens = acc[el.depositor].totalEth;

      return acc;
    }, {} as Record<string, LeaderboardStaker>)
  ).sort((a, b) => b.totalEth - a.totalEth).slice(0, MAX_LEADERBOARD_SIZE);

  return {
    partial,
    total,
  };
}

export function useLeaderboard(network: SupportedNetwork): UseQueryResult<LeaderboardData> {
  const { data: exchangeRates } = useExchangeRates(network);
  const { data: strategyShareRates } = useStrategyShareRates(network);

  const result = useQuery({
    queryKey: getLeaderboardQueryKey(network, exchangeRates, strategyShareRates),
    queryFn: () => queryLeaderboard(network, exchangeRates!, strategyShareRates!),
    enabled: !!exchangeRates && !!strategyShareRates,
    retry: false,
  });

  return result;
}