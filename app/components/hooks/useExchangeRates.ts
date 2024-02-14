import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { SupportedNetwork, TokenRecord } from "@/app/utils/types";
import {
  RocketTokenRETH__factory,
  StakedTokenV1__factory,
  PriceFeed__factory,
  SwETH__factory,
  AETH_R21__factory,
  OETH__factory,
  SfrxETH__factory,
  MantleStaking__factory,
  RiverV1__factory,
} from "@/typechain";
import { getNetworkProvider, getTokenNetworkInfo } from "@/app/utils/constants";

export type ExchangeRates = TokenRecord<number | null>;

export function getExchangeRatesQueryKey(network: SupportedNetwork): any[] {
  return ["exchangeRates", network];
}

export async function queryExchangeRates(network: SupportedNetwork): Promise<ExchangeRates> {
  const provider = getNetworkProvider(network);

  const rEth = getTokenNetworkInfo(network, "rEth")
    ? RocketTokenRETH__factory.connect(getTokenNetworkInfo(network, "rEth")!.address, provider)
    : null;
  const rEthRate = rEth ? rEth.getExchangeRate().then(val => Number(val) / 1e18) : null;

  const cbEth = getTokenNetworkInfo(network, "cbEth")
    ? StakedTokenV1__factory.connect(getTokenNetworkInfo(network, "cbEth")!.address, provider)
    : null;
  const cbEthRate = cbEth ? cbEth.exchangeRate().then(val => Number(val) / 1e18) : null;

  const wBEth = getTokenNetworkInfo(network, "wBEth")
    ? StakedTokenV1__factory.connect(getTokenNetworkInfo(network, "wBEth")!.address, provider)
    : null;
  const wBEthRate = wBEth ? wBEth.exchangeRate().then(val => Number(val) / 1e18) : null;

  const osEth = getTokenNetworkInfo(network, "osEth")
    ? PriceFeed__factory.connect(getTokenNetworkInfo(network, "osEth")!.feed!, provider)
    : null;
  const osEthRate = osEth ? osEth.latestAnswer().then(val => Number(val) / 1e18) : null;

  const swEth = getTokenNetworkInfo(network, "swEth")
  ? SwETH__factory.connect(getTokenNetworkInfo(network, "swEth")!.address, provider)
  : null;
  const swEthRate = swEth ? swEth.getRate().then(val => Number(val) / 1e18) : null;

  const ankrEth = getTokenNetworkInfo(network, "ankrEth")
  ? AETH_R21__factory.connect(getTokenNetworkInfo(network, "ankrEth")!.address, provider)
  : null;
  const ankrEthRate = ankrEth ? ankrEth.sharesToBonds(BigInt(1e18)).then(val => Number(val) / 1e18) : null;

  const ethX = getTokenNetworkInfo(network, "ethX")
  ? RocketTokenRETH__factory.connect(getTokenNetworkInfo(network, "ethX")!.feed!, provider)
  : null;
  const ethXRate = ethX ? ethX.getExchangeRate().then(val => Number(val) / 1e18) : null;

  const oEth = getTokenNetworkInfo(network, "oEth")
  ? OETH__factory.connect(getTokenNetworkInfo(network, "oEth")!.address, provider)
  : null;
  const oEthRate = oEth ? oEth.rebasingCreditsPerToken().then(val => Number(BigInt(1e36) / val) / 1e18) : null;

  const sfrxEth = getTokenNetworkInfo(network, "sfrxEth")
  ? SfrxETH__factory.connect(getTokenNetworkInfo(network, "sfrxEth")!.address, provider)
  : null;
  const sfrxEthRate = sfrxEth ? sfrxEth.convertToAssets(BigInt(1e18)).then(val => Number(val) / 1e18) : null;

  const lsEth = getTokenNetworkInfo(network, "lsEth")
  ? RiverV1__factory.connect(getTokenNetworkInfo(network, "lsEth")!.address, provider)
  : null;
  const lsEthRate = lsEth ? lsEth.underlyingBalanceFromShares(BigInt(1e18)).then(val => Number(val) / 1e18) : null;

  const mEth = getTokenNetworkInfo(network, "mEth")
  ? MantleStaking__factory.connect(getTokenNetworkInfo(network, "mEth")!.feed!, provider)
  : null;
  const mEthRate = mEth ? mEth.mETHToETH(BigInt(1e18)).then(val => Number(val) / 1e18) : null;

  return {
    stEth: 1,
    rEth: await rEthRate,
    cbEth: await cbEthRate,
    wBEth: await wBEthRate,
    osEth: await osEthRate,
    swEth: await swEthRate,
    ankrEth: await ankrEthRate,
    ethX: await ethXRate,
    oEth: await oEthRate,
    sfrxEth: await sfrxEthRate,
    lsEth: await lsEthRate,
    mEth: await mEthRate,
    beacon: 1,
  };
}

export function useExchangeRates(network: SupportedNetwork): UseQueryResult<ExchangeRates> {
  const result = useQuery({
    queryKey: ["exchangeRates", network],
    queryFn: () => queryExchangeRates(network),
    retry: false,
  });

  return result;
}
