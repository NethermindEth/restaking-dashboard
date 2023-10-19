export const MAX_LEADERBOARD_SIZE = 50;

export const getNetworkTokens = (network: string) => {
  switch (network) {
    case "eth": {
      return {
        url: process.env.NEXT_PUBLIC_MAINNET_URL || "",
        tokens: {
          stEth: {
            strategyAddress: "0x93c4b944D05dfe6df7645A86cd2206016c51564D",
            address: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
            image: "/steth.webp",
            color: "data-card-steth",
          },
          rEth: {
            strategyAddress: "0x1BeE69b7dFFfA4E2d53C2a2Df135C388AD25dCD2",
            address: "0xae78736Cd615f374D3085123A210448E74Fc6393",
            image: "/reth.webp",
            color: "data-card-reth",
          },
          cbEth: {
            strategyAddress: "0x54945180dB7943c0ed0FEE7EdaB2Bd24620256bc",
            address: "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704",
            image: "/cbeth.png",
            color: "data-card-cbeth",
          },
        },
      };
    }
    case "goerli": {
      // TODO: update strategy addresses
      return {
        url: process.env.NEXT_PUBLIC_GOERLI_URL || "",
        tokens: {
          stEth: {
            strategyAddress: "0xB613E78E2068d7489bb66419fB1cfa11275d14da",
            address: "0x1643e812ae58766192cf7d2cf9567df2c37e9b7f",
            image: "/steth_logo.webp",
            color: "data-card-steth",
          },
          rEth: {
            strategyAddress: "0x879944A8cB437a5f8061361f82A6d4EED59070b5",
            address: "0x178e141a0e3b34152f73ff610437a7bf9b83267a",
            image: "/reth.webp",
            color: "data-card-reth",
          },
        },
      };
    }
    default: {
      throw Error("Invalid token");
    }
  }
};
