export const supportedStrategyTokens = ["stEth", "rEth", "cbEth"] as const;
export type supportedStrategyToken = (typeof supportedStrategyTokens)[number];

export const supportedTokens = [...supportedStrategyTokens, "beacon"] as const;
export type SupportedToken = (typeof supportedTokens)[number];

export const supportedNetworks = ["eth", "goerli"] as const;
export type SupportedNetwork = (typeof supportedNetworks)[number];

export type TokenRecord<T> = Record<SupportedToken | "beacon", T>;

export interface TokenInfo {
  classId: string;
  label: string;
  image: string;
  color: string;
}

export interface TokenNetworkInfo {
  strategyAddress: `0x${string}`;
  address: `0x${string}`;
}
