import { SupportedNetwork, TokenRecord } from "@/app/utils/types";

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

export function getWithdrawals(network: SupportedNetwork): Promise<ApiWithdrawalsResponse> {
  return fetch(`${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/withdrawals?${new URLSearchParams({
    chain: network,
  })}`).then(resp => resp.json());
}
