import { ethers } from "ethers";

export const clientProvider = new ethers.JsonRpcProvider(
  "https://rpc.ankr.com/eth_goerli",
  "goerli"
);
