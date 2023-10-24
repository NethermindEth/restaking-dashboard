import { ethers } from "ethers";
import { SupportedNetwork, TokenInfo, TokenRecord } from "@/app/utils/types";

export const MAX_LEADERBOARD_SIZE = 50;

if (process.env.NEXT_PUBLIC_MAINNET_URL === undefined) {
  throw new Error("NEXT_PUBLIC_MAINNET_URL env variable not set");
}

export const ETH_MAINNET_PROVIDER = new ethers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_MAINNET_URL,
);

if (process.env.NEXT_PUBLIC_GOERLI_URL === undefined) {
  throw new Error("NEXT_PUBLIC_GOERLI_URL env variable not set");
}

export const GOERLI_PROVIDER = new ethers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_GOERLI_URL,
);

export const getNetworkProvider = (network: SupportedNetwork) => {
  switch (network) {
    case "eth":
      return ETH_MAINNET_PROVIDER;
    case "goerli":
      return GOERLI_PROVIDER;
    default:
      throw Error("Invalid network");
  }
};

export const getNetworkTokens = (network: SupportedNetwork): Partial<TokenRecord<TokenInfo>> => {
  switch (network) {
    case "eth":
      return {
        stEth: {
          label: "stEth",
          strategyAddress: "0x93c4b944D05dfe6df7645A86cd2206016c51564D",
          address: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
          image: "/steth_logo.webp",
          color: "data-card-steth",
        },
        rEth: {
          label: "rEth",
          strategyAddress: "0x1BeE69b7dFFfA4E2d53C2a2Df135C388AD25dCD2",
          address: "0xae78736Cd615f374D3085123A210448E74Fc6393",
          image: "/reth.webp",
          color: "data-card-reth",
        },
        cbEth: {
          label: "cbEth",
          strategyAddress: "0x54945180dB7943c0ed0FEE7EdaB2Bd24620256bc",
          address: "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704",
          image: "/cbeth.png",
          color: "data-card-cbeth",
        },
        beacon: {
          label: "Beacon Chain ETH",
          strategyAddress: ethers.ZeroAddress as `0x${string}`,
          address: ethers.ZeroAddress as `0x${string}`,
          image: "/beaconChainETH.png",
          color: "data-card-eth",
        },
      };
    case "goerli":
      return {
        stEth: {
          label: "stEth",
          strategyAddress: "0xB613E78E2068d7489bb66419fB1cfa11275d14da",
          address: "0x1643e812ae58766192cf7d2cf9567df2c37e9b7f",
          image: "/steth_logo.webp",
          color: "data-card-steth",
        },
        rEth: {
          label: "rEth",
          strategyAddress: "0x879944A8cB437a5f8061361f82A6d4EED59070b5",
          address: "0x178e141a0e3b34152f73ff610437a7bf9b83267a",
          image: "/reth.webp",
          color: "data-card-reth",
        },
        beacon: {
          label: "Beacon Chain ETH",
          strategyAddress: ethers.ZeroAddress as `0x${string}`,
          address: ethers.ZeroAddress as `0x${string}`,
          image: "/beaconChainETH.png",
          color: "data-card-eth",
        },
      };
    default:
      throw Error("Invalid network");
  }
};
