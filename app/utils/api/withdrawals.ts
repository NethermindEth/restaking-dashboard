import { SupportedNetwork, TimeRange, Timeline, TokenRecord } from "@/app/utils/types";
import { groupWithdrawalsByTime } from "@/app/utils/groupByTime";

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

export async function getWithdrawals(network: SupportedNetwork, timeRange: TimeRange, timeline: Timeline, requestInit?: RequestInit): Promise<ApiWithdrawalsResponse> {
  const resp = await fetch(`${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/withdrawals?${new URLSearchParams({
    chain: network,
    timeline,
  })}`, requestInit);
  const data = await resp.json();
  return groupWithdrawalsByTime(data, timeRange);
}
