export const supportedStrategyTokens = ["stEth", "rEth", "cbEth"] as const;
export type supportedStrategyToken = (typeof supportedStrategyTokens)[number];

export const supportedTokens = [...supportedStrategyTokens, "beacon"] as const;
export type SupportedToken = (typeof supportedTokens)[number];

export const supportedNetworks = ["eth", "goerli"] as const;
export type SupportedNetwork = (typeof supportedNetworks)[number];

export type TokenRecord<T> = Record<SupportedToken | "beacon", T>;

export const supportedTimelines = ["1w", "1m", "1y", "full"] as const;
export type Timeline = (typeof supportedTimelines)[number];

export const supportedTimeRanges = ["daily", "weekly", "monthly"] as const;
export type TimeRange = (typeof supportedTimeRanges)[number];

export interface TokenInfo {
  classId: string;
  label: string;
  image: string;
}


export interface TokenNetworkInfo {
  strategyAddress: `0x${string}`;
  address: `0x${string}`;
}
