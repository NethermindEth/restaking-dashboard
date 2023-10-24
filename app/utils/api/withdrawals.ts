import axios, { AxiosResponse } from "axios";
import { SupportedNetwork, TokenRecord } from "@/app/utils";

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

export function getWithdrawals(network: SupportedNetwork): Promise<AxiosResponse<ApiWithdrawalsResponse>> {
  return axios.get<ApiWithdrawalsResponse>(`${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/withdrawals`, {
    params: {
      chain: network,
    },
  });
}
