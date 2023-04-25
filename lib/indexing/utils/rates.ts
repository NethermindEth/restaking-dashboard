import { clientProvider } from "@/lib/clientProvider";
import { IStrategy__factory, RocketTokenRETH__factory } from "../../../typechain";
import { RETH_ADDRESS, STETH_STRATEGY_ADDRESS } from "./constants";
import { ethers } from "ethers";

export async function stEthSharesExchangeRate(
  provider: ethers.Provider = clientProvider,
): Promise<bigint> {
  const strategy = IStrategy__factory.connect(STETH_STRATEGY_ADDRESS, provider);

  return await strategy.sharesToUnderlyingView(BigInt(1e18));
}

export async function rEthSharesExchangeRate(
  provider: ethers.Provider = clientProvider,
): Promise<bigint> {
  const rEth = RocketTokenRETH__factory.connect(RETH_ADDRESS, provider);

  return await rEth.getExchangeRate();
}

export function sharesToEth(shares: bigint, rate: bigint): bigint {
  return shares * rate / BigInt(1e18);
}
