import { ethers } from "ethers";
import { TokenNetworkInfo, SupportedNetwork, SupportedToken, TokenInfo, TokenRecord } from "@/app/utils/types";

export const MAX_LEADERBOARD_SIZE = 50;
export const DEFAULT_TIMELINE = "1y"
export const DEFAULT_TIMERANGE = "daily"

if (process.env.NEXT_PUBLIC_MAINNET_RPC_URL === undefined) {
  throw new Error("NEXT_PUBLIC_MAINNET_RPC_URL env variable not set");
}

export const ETH_MAINNET_PROVIDER = new ethers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_MAINNET_RPC_URL,
);

if (process.env.NEXT_PUBLIC_GOERLI_RPC_URL === undefined) {
  throw new Error("NEXT_PUBLIC_GOERLI_RPC_URL env variable not set");
}

export const GOERLI_PROVIDER = new ethers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_GOERLI_RPC_URL,
);

export function getNetworkProvider(network: SupportedNetwork) {
  switch (network) {
    case "eth":
      return ETH_MAINNET_PROVIDER;
    case "goerli":
      return GOERLI_PROVIDER;
    default:
      throw Error("Invalid network");
  }
};

export const TOKEN_INFO: TokenRecord<TokenInfo> = {
  stEth: {
    classId: "steth",
    label: "stEth",
    image: "/steth_logo.webp",
  },
  rEth: {
    classId: "reth",
    label: "rEth",
    image: "/reth.webp",
  },
  cbEth: {
    classId: "cbeth",
    label: "cbEth",
    image: "/cbeth.png",
  },
  beacon: {
    classId: "beacon",
    label: "Beacon Chain ETH",
    image: "/beaconChainETH.png",
  },
};

export const NETWORK_TOKEN_INFO: Record<SupportedNetwork, Partial<TokenRecord<TokenNetworkInfo>>> = {
  "eth": {
    stEth: {
      strategyAddress: "0x93c4b944D05dfe6df7645A86cd2206016c51564D",
      address: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
    },
    rEth: {
      strategyAddress: "0x1BeE69b7dFFfA4E2d53C2a2Df135C388AD25dCD2",
      address: "0xae78736Cd615f374D3085123A210448E74Fc6393",
    },
    cbEth: {
      strategyAddress: "0x54945180dB7943c0ed0FEE7EdaB2Bd24620256bc",
      address: "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704",
    },
    beacon: {
      strategyAddress: ethers.ZeroAddress as `0x${string}`,
      address: ethers.ZeroAddress as `0x${string}`,
    },
  },
  "goerli": {
    stEth: {
      strategyAddress: "0xB613E78E2068d7489bb66419fB1cfa11275d14da",
      address: "0x1643e812ae58766192cf7d2cf9567df2c37e9b7f",
    },
    rEth: {
      strategyAddress: "0x879944A8cB437a5f8061361f82A6d4EED59070b5",
      address: "0x178e141a0e3b34152f73ff610437a7bf9b83267a",
    },
    beacon: {
      strategyAddress: ethers.ZeroAddress as `0x${string}`,
      address: ethers.ZeroAddress as `0x${string}`,
    },
  },
};

export function getTokenInfo(token: SupportedToken) {
  return TOKEN_INFO[token];
}

export function getTokenNetworkInfo(network: SupportedNetwork, token: SupportedToken) {
  return NETWORK_TOKEN_INFO[network][token];
}

export function getNetworkTokens(network: SupportedNetwork): SupportedToken[] {
  return Object.keys(NETWORK_TOKEN_INFO[network]) as SupportedToken[];
}

export function getNetworkStrategyTokens(network: SupportedNetwork): SupportedToken[] {
  return getNetworkTokens(network).filter(token => token !== "beacon");
}
