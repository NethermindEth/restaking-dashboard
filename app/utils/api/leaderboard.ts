import { SupportedNetwork, TokenRecord } from "@/app/utils/types";

export interface ApiLeaderboardEntry {
  depositor: `0x${string}`;
  totalShares: number;
}

export interface ApiLeaderboardResponse {
  leaderboard: TokenRecord<ApiLeaderboardEntry[] | null>;
}

export function getLeaderboard(network: SupportedNetwork): Promise<ApiLeaderboardResponse> {
  return fetch(`${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/leaderboard?${new URLSearchParams({
    chain: network,
  })}`).then(resp => resp.json());
}
