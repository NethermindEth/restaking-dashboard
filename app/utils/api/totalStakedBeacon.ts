import { SupportedNetwork } from "@/app/utils/types";

export interface ApiTotalStakedBeaconResponse {
  totalStakedBeacon: number;
}

export function getTotalStakedBeacon(network: SupportedNetwork, requestInit?: RequestInit): Promise<ApiTotalStakedBeaconResponse> {
  return fetch(`${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/totalStakedBeacon?${new URLSearchParams({
    chain: network,
    timeline: "1m",
  })}`, requestInit).then(resp => resp.json());
}
