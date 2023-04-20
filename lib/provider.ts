import { ethers } from "ethers";

export const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "");
