import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { SupportedNetwork, TokenRecord } from "@/app/utils/types";
import {
  RocketTokenRETH__factory,
  StakedTokenV1__factory,
  StrategyBaseTVLLimits__factory,
} from "@/typechain";
import { getNetworkTokens, getNetworkProvider } from "@/app/utils/constants";

export type ShareRates = TokenRecord<number | null>;

export function getShareRatesQueryKey(network: SupportedNetwork): any[] {
  return ["shareRates", network];
}

export async function queryShareRates(network: SupportedNetwork, _: boolean = false): Promise<ShareRates> {
  const networkToken = getNetworkTokens(network);
  const provider = getNetworkProvider(network);

  const rEth = networkToken["rEth"]
    ? RocketTokenRETH__factory.connect(networkToken["rEth"].address, provider)
    : null;
  const rEthRate = rEth ? Number(await rEth.getExchangeRate()) / 1e18 : 0;

  const cbEth = networkToken["cbEth"]
    ? StakedTokenV1__factory.connect(networkToken["cbEth"].address, provider)
    : null;
  const cbEthRate = cbEth ? Number(await cbEth.exchangeRate()) / 1e18 : 0;

  const stEthStrategy = networkToken["stEth"]
    ? StrategyBaseTVLLimits__factory.connect(
        networkToken["stEth"].strategyAddress,
        provider
      )
    : null;
  const rEthStrategy = networkToken["rEth"]
    ? StrategyBaseTVLLimits__factory.connect(
        networkToken["rEth"].strategyAddress,
        provider
      )
    : null;
  const cbEthStrategy = networkToken["cbEth"]
    ? StrategyBaseTVLLimits__factory.connect(
        networkToken["cbEth"].strategyAddress,
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

export function useShareRates(network: SupportedNetwork): UseQueryResult<ShareRates> {
  const result = useQuery({
    queryKey: ["shareRates", network],
    queryFn: () => queryShareRates(network),
    retry: false,
  });

  return result;
}
