import { SupportedNetwork, TokenRecord, SupportedTimeline } from "@/app/utils/types";

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

export async function getDeposits(network: SupportedNetwork, timeline: SupportedTimeline, requestInit?: RequestInit): Promise<ApiDepositsResponse> {
  const resp = await fetch(`${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/deposits?${new URLSearchParams({
    chain: network,
    timeline,
  })}`, requestInit);
  return await resp.json();
}
