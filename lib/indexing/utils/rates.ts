import { clientProvider } from "@/lib/clientProvider";
import { IStrategy__factory, RocketTokenRETH__factory } from "../../../typechain";
import { RETH_ADDRESS, STETH_STRATEGY_ADDRESS } from "./constants";
import { ethers } from "ethers";

/**
 * Gets the exchange rate for stETH strategy shares to ETH.
 * @param provider Provider that will be used to fetch data, by default a
 * public provider.
 * @returns The stETH strategy shares -> ETH exchange rate with 18 decimals.
 */
export async function stEthSharesExchangeRate(
  provider: ethers.Provider = clientProvider,
): Promise<bigint> {
  const strategy = IStrategy__factory.connect(STETH_STRATEGY_ADDRESS, provider);

  return await strategy.sharesToUnderlyingView(BigInt(1e18));
}

/**
 * Gets the exchange rate for stETH strategy shares to ETH as a (float)
 * `number`. There may be some precision loss, so prefer
 * `stEthSharesExchangeRate`.
 * @param provider Provider that will be used to fetch data, by default a
 * public provider.
 * @returns The stETH strategy shares -> ETH exchange as a `number`.
 */
export async function stEthSharesExchangeRateAsNumber(
  provider: ethers.Provider = clientProvider,
): Promise<number> {
  return Number(await stEthSharesExchangeRate(provider)) / 1e18;
}

/**
 * Gets the exchange rate for rETH strategy shares to ETH.
 * @param provider Provider that will be used to fetch data, by default a
 * public provider.
 * @returns The rETH strategy shares -> ETH exchange rate with 18 decimals.
 */
export async function rEthSharesExchangeRate(
  provider: ethers.Provider = clientProvider,
): Promise<bigint> {
  const rEth = RocketTokenRETH__factory.connect(RETH_ADDRESS, provider);

  return await rEth.getExchangeRate();
}

/**
 * Gets the exchange rate for rETH strategy shares to ETH as a (float)
 * `number`. There may be some precision loss, so prefer
 * `rEthSharesExchangeRate`.
 * @param provider Provider that will be used to fetch data, by default a
 * public provider.
 * @returns The rETH strategy shares -> ETH exchange as a `number`.
 */
export async function rEthSharesExchangeRateAsNumber(
  provider: ethers.Provider = clientProvider,
): Promise<number> {
  return Number(await rEthSharesExchangeRate(provider)) / 1e18;
}

/**
 * Computes the ETH relative to an amount in strategy shares. Basically a wad
 * multiplication.
 * @param shares Share amount with 18 decimals.
 * @param rate Exchange rate with 18 decimals.
 * @returns The corresponding ETH amount with 18 decimals.
 */
export function sharesToEth(shares: bigint, rate: bigint): bigint {
  return shares * rate / BigInt(1e18);
}
