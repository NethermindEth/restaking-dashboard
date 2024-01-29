import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { SupportedNetwork, TokenRecord, supportedStrategyTokens } from "@/app/utils/types";
import {
  RocketTokenRETH__factory,
  StakedTokenV1__factory,
  StrategyBaseTVLLimits__factory,
  PriceFeed__factory,
  SwETH__factory,
  AETH_R21__factory,
  OETH__factory,
  SfrxETH__factory,
  MantleStaking__factory,
  RiverV1__factory,
} from "@/typechain";
import { getNetworkProvider, getTokenNetworkInfo } from "@/app/utils/constants";

export type ShareRates = TokenRecord<number | null>;

export function getShareRatesQueryKey(network: SupportedNetwork): any[] {
  return ["shareRates", network];
}

export async function queryShareRates(network: SupportedNetwork, _: boolean = false): Promise<ShareRates> {
  const provider = getNetworkProvider(network);

  const rEth = getTokenNetworkInfo(network, "rEth")
    ? RocketTokenRETH__factory.connect(getTokenNetworkInfo(network, "rEth")!.address, provider)
    : null;
  const rEthRate = rEth ? rEth.getExchangeRate().then(val => Number(val) / 1e18) : 0;

  const cbEth = getTokenNetworkInfo(network, "cbEth")
    ? StakedTokenV1__factory.connect(getTokenNetworkInfo(network, "cbEth")!.address, provider)
    : null;
  const cbEthRate = cbEth ? cbEth.exchangeRate().then(val => Number(val) / 1e18) : 0;

  const wBEth = getTokenNetworkInfo(network, "wBEth")
    ? StakedTokenV1__factory.connect(getTokenNetworkInfo(network, "wBEth")!.address, provider)
    : null;
  const wBEthRate = wBEth ? wBEth.exchangeRate().then(val => Number(val) / 1e18) : 0;

  const osEth = getTokenNetworkInfo(network, "osEth")
    ? PriceFeed__factory.connect(getTokenNetworkInfo(network, "osEth")!.feed!, provider)
    : null;
  const osEthRate = osEth ? osEth.latestAnswer().then(val => Number(val) / 1e18) : 0;

  const swEth = getTokenNetworkInfo(network, "swEth")
  ? SwETH__factory.connect(getTokenNetworkInfo(network, "swEth")!.address, provider)
  : null;
  const swEthRate = swEth ? swEth.getRate().then(val => Number(val) / 1e18) : 0;

  const ankrEth = getTokenNetworkInfo(network, "ankrEth")
  ? AETH_R21__factory.connect(getTokenNetworkInfo(network, "ankrEth")!.address, provider)
  : null;
  const ankrEthRate = ankrEth ? ankrEth.sharesToBonds(BigInt(1e18)).then(val => Number(val) / 1e18) : 0;

  const ethX = getTokenNetworkInfo(network, "ethX")
  ? RocketTokenRETH__factory.connect(getTokenNetworkInfo(network, "ethX")!.feed!, provider)
  : null;
  const ethXRate = ethX ? ethX.getExchangeRate().then(val => Number(val) / 1e18) : 0;

  const oEth = getTokenNetworkInfo(network, "oEth")
  ? OETH__factory.connect(getTokenNetworkInfo(network, "oEth")!.address, provider)
  : null;
  const oEthRate = oEth ? oEth.rebasingCreditsPerToken().then(val => Number(BigInt(1e36) / val) / 1e18) : 0;

  const sfrxEth = getTokenNetworkInfo(network, "sfrxEth")
  ? SfrxETH__factory.connect(getTokenNetworkInfo(network, "sfrxEth")!.address, provider)
  : null;
  const sfrxEthRate = sfrxEth ? sfrxEth.convertToAssets(BigInt(1e18)).then(val => Number(val) / 1e18) : 0;

  const lsEth = getTokenNetworkInfo(network, "lsEth")
  ? RiverV1__factory.connect(getTokenNetworkInfo(network, "lsEth")!.address, provider)
  : null;
  const lsEthRate = lsEth ? lsEth.underlyingBalanceFromShares(BigInt(1e18)).then(val => Number(val) / 1e18) : 0;

  const mEth = getTokenNetworkInfo(network, "mEth")
  ? MantleStaking__factory.connect(getTokenNetworkInfo(network, "mEth")!.feed!, provider)
  : null;
  const mEthRate = mEth ? mEth.mETHToETH(BigInt(1e18)).then(val => Number(val) / 1e18) : 0;

  const strategyRates = supportedStrategyTokens.reduce((acc, token) => {
    const strategy = getTokenNetworkInfo(network, token)
      ? StrategyBaseTVLLimits__factory.connect(
        getTokenNetworkInfo(network, token)!.strategyAddress,
        provider
      )
      : null;

    acc[token] = strategy
      ? strategy.sharesToUnderlyingView(BigInt(1e18)).then(val => Number(val) / 1e18)
      : null;
    
    return acc;
  }, {} as TokenRecord<Promise<number> | null>);

  return {
    stEth: strategyRates["stEth"] ? await strategyRates["stEth"] : null,
    rEth: strategyRates["rEth"] ? await strategyRates["rEth"] * await rEthRate : null,
    cbEth: strategyRates["cbEth"] ? await strategyRates["cbEth"] * await cbEthRate : null,
    wBEth: strategyRates["wBEth"] ? await strategyRates["wBEth"] * await wBEthRate : null,
    osEth: strategyRates["osEth"] ? await strategyRates["osEth"] * await osEthRate : null,
    swEth: strategyRates["swEth"] ? await strategyRates["swEth"] * await swEthRate : null,
    ankrEth: strategyRates["ankrEth"] ? await strategyRates["ankrEth"] * await ankrEthRate : null,
    ethX: strategyRates["ethX"] ? await strategyRates["ethX"] * await ethXRate : null,
    oEth: strategyRates["oEth"] ? await strategyRates["oEth"] * await oEthRate : null,
    sfrxEth: strategyRates["sfrxEth"] ? await strategyRates["sfrxEth"] * await sfrxEthRate : null,
    lsEth: strategyRates["lsEth"] ? await strategyRates["lsEth"] * await lsEthRate : null,
    mEth: strategyRates["mEth"] ? await strategyRates["mEth"] * await mEthRate : null,
    beacon: 1,
  };
}

export function useShareRates(network: SupportedNetwork): UseQueryResult<ShareRates> {
  const result = useQuery({
    queryKey: ["shareRates", network],
    queryFn: () => queryShareRates(network),
    retry: false,
  });

  return result;
}
