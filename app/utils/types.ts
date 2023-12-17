export const supportedStrategyTokens = [
  "stEth",
  "rEth",
  "cbEth",
  "wBEth",
  "osEth",
  "swEth",
  "ankrEth",
  "ethX",
  "oEth",
] as const;
export type SupportedStrategyToken = (typeof supportedStrategyTokens)[number];

export const supportedTokens = [...supportedStrategyTokens, "beacon"] as const;
export type SupportedToken = (typeof supportedTokens)[number];

export const supportedNetworks = ["eth", "goerli"] as const;
export type SupportedNetwork = (typeof supportedNetworks)[number];

export const supportedTimelines = ["1w", "1m", "1y", "full"] as const;
export type SupportedTimeline = (typeof supportedTimelines)[number];

export const supportedTimeRanges = ["daily", "weekly", "monthly"] as const;
export type SupportedTimeRange = (typeof supportedTimeRanges)[number];

export type TokenRecord<T> = Record<SupportedToken | "beacon", T>;

export const timelineToDays: Record<SupportedTimeline, number> = {
  "1w": 7,
  "1m": 30,
  "1y": 365,
  "full": Infinity,
} as const;

export interface TokenInfo {
  classId: string;
  label: string;
  image: string;
  color: string;
}

export interface TokenNetworkInfo {
  strategyAddress: `0x${string}`;
  address: `0x${string}`;
  feed?: `0x${string}`;
}
