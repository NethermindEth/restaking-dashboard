import { SupportedNetwork, TokenRecord } from "@/app/utils/types";

export interface ApiDepositsEntry {
  totalAmount: number;
  totalShares: number;
  cumulativeAmount: number;
  cumulativeShares: number;
}

export interface ApiDepositsResponse {
  timestamps: string[];
  deposits: TokenRecord<ApiDepositsEntry[] | null>;
}

export function getDeposits(network: SupportedNetwork, requestInit?: RequestInit): Promise<ApiDepositsResponse> {
  return fetch(`${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/deposits?${new URLSearchParams({
    chain: network,
    timeline: "1m",
  })}`, requestInit).then(resp => resp.json());
}