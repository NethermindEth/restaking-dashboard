import { IStrategy__factory, RocketTokenRETH__factory, StEth__factory } from "@/typechain";
import { RETH_ADDRESS, STETH_ADDRESS, STETH_STRATEGY_ADDRESS } from "./constants";
import { provider } from "../../provider";

export async function stEthSharesExchangeRate(): Promise<bigint> {
  const strategy = IStrategy__factory.connect(STETH_STRATEGY_ADDRESS, provider);
  const stEth = StEth__factory.connect(STETH_ADDRESS, provider);

  return await strategy.sharesToUnderlyingView(BigInt(1e18)) * await stEth.getTotalPooledEther() / await stEth.getTotalShares();
}

export async function rEthSharesExchangeRate(): Promise<bigint> {
  const rEth = RocketTokenRETH__factory.connect(RETH_ADDRESS, provider);

  return await rEth.getExchangeRate();
}

export function sharesToEth(shares: bigint, rate: bigint): bigint {
  return shares * rate / BigInt(1e18);
}
