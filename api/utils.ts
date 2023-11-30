
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
      };
    case "goerli":
      return {
        stEthAddress: "0x1643e812ae58766192cf7d2cf9567df2c37e9b7f",
        cbEthAddress: undefined,
        rEthAddress: "0x178e141a0e3b34152f73ff610437a7bf9b83267a",
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
