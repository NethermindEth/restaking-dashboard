import { SupportedNetwork, TokenRecord, supportedTokens } from "@/app/utils";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { useShareRates } from "./useShareRates";
import { getLeaderboard } from "@/app/utils/api/leaderboard";

export interface LeaderboardStaker {
  depositor: `0x${string}`;
  totalEth: number;
}

export interface LeaderboardData {
  partial: TokenRecord<LeaderboardStaker[] | null>;
  total: LeaderboardStaker[];
}

export function useLeaderboard(network: SupportedNetwork): UseQueryResult<LeaderboardData> {
  const { data: rates } = useShareRates(network);

  const result = useQuery({
    queryKey: ["leaderboard", network, rates],
    queryFn: async (): Promise<LeaderboardData> => {
      if (!rates) throw new Error("Rates were not yet fetched");

      const { data: result } = await getLeaderboard(network);
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
      ).sort((a, b) => b.totalEth - a.totalEth).slice(0, 50);

      return {
        partial,
        total,
      };
    },
    enabled: !!rates,
    retry: false,
  });

  return result;
}