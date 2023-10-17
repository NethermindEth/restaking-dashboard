export interface DailyTokenData {
  date: string;
  total_amount: number;
  total_shares: number;
  cumulative_amount: number;
  cumulative_shares: number;
}

export interface DailyTokenWithdrawals {
  date: string | null;
  total_amount: number | null;
  total_shares: number | null;
}

export interface LeaderboardUserData {
  depositor: string;
  totalStaked: number;
}

export const supportedChains = ["mainnet", "goerli"] as const;
export type Chain = typeof supportedChains[number];

export function getContractAddresses(chain: Chain) {
  switch (chain) {
    case "mainnet":
      return {
        STETH_ADDRESS: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
        CBETH_ADDRESS: "0x7c6b91d9be155a6db01f749217d76ff02a7227f2",
        RETH_ADDRESS: "0xae78736cd615f374d3085123a210448e74fc6393",
      };
    case "goerli":
      return {
        STETH_ADDRESS: "0x1643e812ae58766192cf7d2cf9567df2c37e9b7f",
        CBETH_ADDRESS: "0x7c6b91d9be155a6db01f749217d76ff02a7227f2",
        RETH_ADDRESS: "0x178e141a0e3b34152f73ff610437a7bf9b83267a",
      };
    default:
      throw new Error(`Unknown network '${chain}'`);
  }
}
