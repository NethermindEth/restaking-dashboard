import axios, { AxiosResponse } from "axios";
import { SupportedNetwork, TokenRecord } from "@/app/utils";

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

export function getDeposits(network: SupportedNetwork): Promise<AxiosResponse<ApiDepositsResponse>> {
  return axios.get<ApiDepositsResponse>(`${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/deposits`, {
    params: {
      chain: network,
    },
  });
}
