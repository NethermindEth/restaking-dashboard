import { IStrategy__factory, RocketTokenRETH__factory } from "../../../typechain";
import { RETH_ADDRESS, STETH_STRATEGY_ADDRESS } from "./constants";
import { ethers } from "ethers";

export async function stEthSharesExchangeRate(): Promise<bigint> {
  const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli");
  const strategy = IStrategy__factory.connect(STETH_STRATEGY_ADDRESS, provider);

  return await strategy.sharesToUnderlyingView(BigInt(1e18));
}

export async function rEthSharesExchangeRate(): Promise<bigint> {
  const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli");
  const rEth = RocketTokenRETH__factory.connect(RETH_ADDRESS, provider);

  return await rEth.getExchangeRate();
}

export function sharesToEth(shares: bigint, rate: bigint): bigint {
  return shares * rate / BigInt(1e18);
}
