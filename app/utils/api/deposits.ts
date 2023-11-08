import { SupportedNetwork, TokenRecord, TimeRange, Timeline } from "@/app/utils/types";
import { groupDepositsByTime } from "@/app/utils/groupByTime";

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

export async function getDeposits(network: SupportedNetwork, timeRange: TimeRange, timeline: Timeline, requestInit?: RequestInit): Promise<ApiDepositsResponse> {
  const resp = await fetch(`${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/deposits?${new URLSearchParams({
    chain: network,
    timeline,
  })}`, requestInit);
  const data = await resp.json();
  return groupDepositsByTime(data, timeRange);
}
