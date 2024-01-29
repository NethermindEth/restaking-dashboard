import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { SupportedNetwork, TokenRecord, supportedStrategyTokens } from "@/app/utils/types";
import {
  StrategyBaseTVLLimits__factory,
} from "@/typechain";
import { getNetworkProvider, getTokenNetworkInfo } from "@/app/utils/constants";

export type StrategyShareRates = TokenRecord<number | null>;

export function getStrategyShareRatesQueryKey(network: SupportedNetwork): any[] {
  return ["strategyShareRates", network];
}

export async function queryStrategyShareRates(network: SupportedNetwork, _: boolean = false): Promise<StrategyShareRates> {
  const provider = getNetworkProvider(network);

  const strategyShareRates: Partial<StrategyShareRates> = {
    beacon: 1,
  };

  await Promise.all(
    supportedStrategyTokens.map(async token => {
      const strategy = getTokenNetworkInfo(network, token)
        ? StrategyBaseTVLLimits__factory.connect(
          getTokenNetworkInfo(network, token)!.strategyAddress,
          provider
        )
        : null;

      strategyShareRates[token] = strategy
        ? Number(await strategy.sharesToUnderlyingView(BigInt(1e18))) / 1e18
        : null;  
    })
  );

  return strategyShareRates as StrategyShareRates;
}

export function useStrategyShareRates(network: SupportedNetwork): UseQueryResult<StrategyShareRates> {
  const result = useQuery({
    queryKey: ["strategyShareRates", network],
    queryFn: () => queryStrategyShareRates(network),
    retry: false,
  });

  return result;
}