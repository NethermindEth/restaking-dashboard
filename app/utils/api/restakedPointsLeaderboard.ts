import { SupportedNetwork } from "@/app/utils/types";

export interface ApiLeaderboardEntry {
  depositor: `0x${string}`;
  totalPoints: number;
}

export interface ApiLeaderboardResponse {
  leaderboard: ApiLeaderboardEntry[];
}

export function getRestakedPointsLeaderboard(
    network: SupportedNetwork,
    requestInit?: RequestInit,
): Promise<ApiLeaderboardResponse> {
  return fetch(`${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/restakedPointsLeaderboard?${new URLSearchParams({
    chain: network,
  })}`, requestInit).then(resp => resp.json());
}
