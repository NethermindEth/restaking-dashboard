import { SupportedNetwork, SupportedTimeRange, SupportedTimeline, TokenRecord } from "@/app/utils/types";

export interface ApiWithdrawalsEntry {
  totalAmount: number;
  totalShares: number;
  cumulativeAmount: number;
  cumulativeShares: number;
}

export interface ApiWithdrawalsResponse {
  timestamps: string[];
  withdrawals: TokenRecord<ApiWithdrawalsEntry[] | null>;
}

export async function getWithdrawals(network: SupportedNetwork, timeline: SupportedTimeline, requestInit?: RequestInit): Promise<ApiWithdrawalsResponse> {
  const resp = await fetch(`${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/withdrawals?${new URLSearchParams({
    chain: network,
    timeline,
  })}`, requestInit);
  return await resp.json();
}
