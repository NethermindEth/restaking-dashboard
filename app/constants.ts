import { ethers } from "ethers";

export const RETH_ADDRESS = "0xae78736Cd615f374D3085123A210448E74Fc6393";
export const CBETH_ADDRESS = "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704";
export const STETH_STRATEGY_ADDRESS =
  "0x93c4b944D05dfe6df7645A86cd2206016c51564D";
export const CBETH_STRATEGY_ADDRESS =
  "0x54945180dB7943c0ed0FEE7EdaB2Bd24620256bc";
export const RETH_STRATEGY_ADDRESS =
  "0x1BeE69b7dFFfA4E2d53C2a2Df135C388AD25dCD2";
export const MAX_LEADERBOARD_SIZE = 50;
export const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth");
