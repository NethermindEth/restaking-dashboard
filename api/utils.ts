
export const supportedChains = ["eth", "goerli"] as const;
export type Chain = (typeof supportedChains)[number];

export const supportedTimelines = ["1w", "1m", "1y", "full"] as const;
export type Timeline = (typeof supportedTimelines)[number];

export function getContractAddresses(chain: Chain) {
  switch (chain) {
    case "eth":
      return {
        stEthAddress: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
        cbEthAddress: "0xbe9895146f7af43049ca1c1ae358b0541ea49704",
        rEthAddress: "0xae78736cd615f374d3085123a210448e74fc6393",
        wBEthAddress: "0xa2e3356610840701bdf5611a53974510ae27e2e1",
        osEthAddress: "0xf1c9acdc66974dfb6decb12aa385b9cd01190e38",
        swEthAddress: "0xf951e335afb289353dc249e82926178eac7ded78",
        ankrEthAddress: "0xe95a203b1a91a908f9b9ce46459d101078c2c3cb",
        ethXAddress: "0xa35b1b31ce002fbf2058d22f30f95d405200a15b",
        oEthAddress: "0x856c4efb76c1d1ae02e20ceb03a2a6a08b0b8dc3",
      };
    case "goerli":
      return {
        stEthAddress: "0x1643e812ae58766192cf7d2cf9567df2c37e9b7f",
        cbEthAddress: undefined,
        rEthAddress: "0x178e141a0e3b34152f73ff610437a7bf9b83267a",
        wBEthAddress: undefined,
        osEthAddress: undefined,
        swEthAddress: undefined,
        ankrEthAddress: "0x2bbc91e1990f0dc5e5bad04aae000ca97f56990f",
        ethXAddress: "0x3338ecd3ab3d3503c55c931d759fa6d78d287236",
        oEthAddress: undefined,
      };
    default:
      throw new Error(`Unknown network '${chain}'`);
  }
}

export const timelineToDays: Readonly<Record<Timeline, number>> = {
  "1w": 7,
  "1m": 30,
  "1y": 365,
  "full": Infinity,
};

export const startingEpochTimestamps: Readonly<Record<Chain, number>> = {
  "eth": 1606824023,
  "goerli": 1616508000,
}
