import axios, { AxiosResponse } from "axios";
import { SupportedNetwork, TokenRecord } from "@/app/utils";

export interface ApiLeaderboardEntry {
  depositor: `0x${string}`;
  totalShares: number;
}

export interface ApiLeaderboardResponse {
  leaderboard: TokenRecord<ApiLeaderboardEntry[] | null>;
}

export function getLeaderboard(network: SupportedNetwork): Promise<AxiosResponse<ApiLeaderboardResponse>> {
  return axios.get<ApiLeaderboardResponse>(`${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/leaderboard`, {
    params: {
      chain: network,
    },
  });
}
