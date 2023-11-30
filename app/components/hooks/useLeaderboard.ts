import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { SupportedNetwork, TokenRecord, supportedTokens } from "@/app/utils/types";
import { ShareRates, useShareRatesTokens, useShareRatesEth } from "./useShareRates";
import { getLeaderboard } from "@/app/utils/api/leaderboard";
import { getRestakedPointsLeaderboard } from "@/app/utils/api/restakedPointsLeaderboard";
import { MAX_LEADERBOARD_SIZE } from "@/app/utils/constants";

export interface LeaderboardStaker {
  depositor: `0x${string}`;
  amount: number;
}

export interface LeaderboardStakerPartial extends LeaderboardStaker {
  totalEth: number;
}

export interface LeaderboardData {
  partial: TokenRecord<LeaderboardStakerPartial[] | null>;
  total: LeaderboardStaker[];
  points: LeaderboardStaker[];
}

export function getLeaderboardQueryKey(network: SupportedNetwork, shareRatesTokens?: ShareRates, shareRatesEth?: ShareRates): any[] {
  return ["leaderboard", network, shareRatesTokens, shareRatesEth];
}

export async function queryLeaderboard(network: SupportedNetwork, shareRatesTokens: ShareRates, shareRatesEth: ShareRates, _: boolean = false): Promise<LeaderboardData> {
  const [
    { leaderboard: restakingLeaderboard },
    { leaderboard: restakedPointsLeaderboard },
  ] = await Promise.all([
    getLeaderboard(network),
    getRestakedPointsLeaderboard(network),
  ]);
  
  const partial = {} as TokenRecord<LeaderboardStakerPartial[] | null>;

  supportedTokens.forEach(token => {
    const tokenLeaderboard = restakingLeaderboard[token];

    partial[token] = tokenLeaderboard
      ? tokenLeaderboard.map(el => ({
        depositor: el.depositor,
        amount: el.totalShares * shareRatesTokens[token]!,
        totalEth: el.totalShares * shareRatesEth[token]!,
      }))
      : null;
  });

  const total = Object.values(
    Object.values(partial).flat().reduce((acc, el) => {
      if (!el) return acc;

      if (!acc[el.depositor]) acc[el.depositor] = { depositor: el.depositor, amount: 0 };
      acc[el.depositor].amount += el.totalEth;

      return acc;
    }, {} as Record<string, LeaderboardStaker>)
  ).sort((a, b) => b.amount - a.amount).slice(0, MAX_LEADERBOARD_SIZE);

  return {
    partial,
    total,
    points: restakedPointsLeaderboard.map(el => ({ depositor: el.depositor, amount: el.totalPoints })),
  };
}

export function useLeaderboard(network: SupportedNetwork): UseQueryResult<LeaderboardData> {
  const { data: shareRatesTokens } = useShareRatesTokens(network);
  const { data: shareRatesEth } = useShareRatesEth(network);

  const result = useQuery({
    queryKey: getLeaderboardQueryKey(network, shareRatesTokens, shareRatesEth),
    queryFn: () => queryLeaderboard(network, shareRatesTokens!, shareRatesEth!),
    enabled: !!shareRatesTokens && !!shareRatesEth,
    retry: false,
  });

  return result;
}