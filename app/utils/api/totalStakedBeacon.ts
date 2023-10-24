import axios, { AxiosResponse } from "axios";
import { SupportedNetwork } from "@/app/utils";

export interface ApiTotalStakedBeaconResponse {
  totalStakedBeacon: number;
}

export function getTotalStakedBeacon(network: SupportedNetwork): Promise<AxiosResponse<ApiTotalStakedBeaconResponse>> {
  return axios.get<ApiTotalStakedBeaconResponse>(`${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/totalStakedBeacon`, {
    params: {
      chain: network,
    },
  });
}
