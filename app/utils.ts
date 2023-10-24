
export const supportedTokens = ["stEth", "rEth", "cbEth", "beacon"] as const;
export type SupportedToken = (typeof supportedTokens)[number];

export const supportedNetworks = ["eth", "goerli"] as const;
export type SupportedNetwork = (typeof supportedNetworks)[number];

export type TokenRecord<T> = Record<SupportedToken | "beacon", T>;

export interface TokenInfo {
  label: string;
  strategyAddress: `0x${string}`;
  address: `0x${string}`;
  image: string;
  color: string;
}
