import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { SupportedNetwork, TokenRecord } from "@/app/utils/types";
import {
  RocketTokenRETH__factory,
  StakedTokenV1__factory,
  StrategyBaseTVLLimits__factory,
} from "@/typechain";
import { getNetworkProvider, getTokenNetworkInfo } from "@/app/utils/constants";

export type ShareRates = TokenRecord<number | null>;

export function getShareRatesTokensQueryKey(network: SupportedNetwork): any[] {
  return ["shareRatesTokens", network];
}

export async function queryShareRatesTokens(network: SupportedNetwork, _: boolean = false): Promise<ShareRates> {
  const provider = getNetworkProvider(network);

  const rEth = getTokenNetworkInfo(network, "rEth")
    ? RocketTokenRETH__factory.connect(getTokenNetworkInfo(network, "rEth")!.address, provider)
    : null;
  const rEthRate = rEth ? Number(await rEth.getExchangeRate()) / 1e18 : 0;

  const cbEth = getTokenNetworkInfo(network, "cbEth")
    ? StakedTokenV1__factory.connect(getTokenNetworkInfo(network, "cbEth")!.address, provider)
    : null;
  const cbEthRate = cbEth ? Number(await cbEth.exchangeRate()) / 1e18 : 0;

  const stEthStrategy = getTokenNetworkInfo(network, "stEth")
    ? StrategyBaseTVLLimits__factory.connect(
        getTokenNetworkInfo(network, "stEth")!.strategyAddress,
        provider
      )
    : null;
  const rEthStrategy = getTokenNetworkInfo(network, "rEth")
    ? StrategyBaseTVLLimits__factory.connect(
        getTokenNetworkInfo(network, "rEth")!.strategyAddress,
        provider
      )
    : null;
  const cbEthStrategy = getTokenNetworkInfo(network, "cbEth")
    ? StrategyBaseTVLLimits__factory.connect(
        getTokenNetworkInfo(network, "cbEth")!.strategyAddress,
        provider
      )
    : null;

  const rEthSharesRate = rEthStrategy
    ? Number(await rEthStrategy.sharesToUnderlyingView(BigInt(1e18))) / 1e18
    : 0;
  const stEthSharesRate = stEthStrategy
    ? Number(await stEthStrategy.sharesToUnderlyingView(BigInt(1e18))) / 1e18
    : 0;
  const cbEthSharesRate = cbEthStrategy
    ? Number(await cbEthStrategy.sharesToUnderlyingView(BigInt(1e18))) / 1e18
    : 0;

  return {
    stEth: stEthStrategy ? stEthSharesRate : null,
    rEth: rEthStrategy ? rEthSharesRate * rEthRate : null,
    cbEth: cbEthStrategy ? cbEthSharesRate * cbEthRate : null,
    beacon: 1,
  };
}

export function getShareRatesEthQueryKey(network: SupportedNetwork, shareRatesTokens?: ShareRates): any[] {
  return ["shareRatesEth", network, shareRatesTokens];
}

export async function queryShareRatesEth(network: SupportedNetwork, shareRatesTokens: ShareRates, _: boolean = false): Promise<ShareRates> {
  const provider = getNetworkProvider(network);

  const rEth = getTokenNetworkInfo(network, "rEth")
    ? RocketTokenRETH__factory.connect(getTokenNetworkInfo(network, "rEth")!.address, provider)
    : null;
  const rEthRate = rEth ? Number(await rEth.getExchangeRate()) / 1e18 : 0;

  const cbEth = getTokenNetworkInfo(network, "cbEth")
    ? StakedTokenV1__factory.connect(getTokenNetworkInfo(network, "cbEth")!.address, provider)
    : null;
  const cbEthRate = cbEth ? Number(await cbEth.exchangeRate()) / 1e18 : 0;

  return {
    stEth: shareRatesTokens.stEth ? shareRatesTokens.stEth : null,
    rEth: shareRatesTokens.rEth ? shareRatesTokens.rEth * rEthRate : null,
    cbEth: shareRatesTokens.cbEth ? shareRatesTokens.cbEth * cbEthRate : null,
    beacon: 1,
  };
}

export function useShareRatesTokens(network: SupportedNetwork): UseQueryResult<ShareRates> {
  const result = useQuery({
    queryKey: getShareRatesTokensQueryKey(network),
    queryFn: () => queryShareRatesTokens(network),
    retry: false,
  });

  return result;
}

export function useShareRatesEth(network: SupportedNetwork): UseQueryResult<ShareRates> {
  const { data: shareRatesTokens } = useShareRatesTokens(network);

  const result = useQuery({
    queryKey: getShareRatesEthQueryKey(network, shareRatesTokens),
    queryFn: () => queryShareRatesEth(network, shareRatesTokens!),
    enabled: !!shareRatesTokens,
    retry: false,
  });

  return result;
}
