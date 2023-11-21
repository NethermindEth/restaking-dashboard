import { ethers } from "ethers";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { IERC20__factory } from "@/typechain";
import { SupportedNetwork, TokenRecord, supportedTokens } from "@/app/utils/types";
import { getNetworkProvider, getTokenNetworkInfo } from "@/app/utils/constants";
import { getTotalStakedBeacon } from "@/app/utils/api/totalStakedBeacon";

async function getStrategyTvl(tokenAddress: `0x${string}`, strategyAddress: `0x${string}`, provider: ethers.Provider): Promise<number> {
  const token = IERC20__factory.connect(tokenAddress, provider);

  return Number(await token.balanceOf(strategyAddress)) / 1e18;
}

export function getTotalStakedTokensQueryKey(network: SupportedNetwork): any[] {
  return ["totalStakedTokens", network];
}

export async function queryTotalStakedTokens(network: SupportedNetwork, _: boolean = false): Promise<TokenRecord<number | null>> {
  const provider = getNetworkProvider(network);
  
  const results = supportedTokens.reduce((acc, token) => {
    if (token == "beacon") {
      acc[token] = getTotalStakedBeacon(network).then((data) => data.totalStakedBeacon);
      return acc;
    }

    const networkInfo = getTokenNetworkInfo(network, token);

    if (!networkInfo) {
      acc[token] = null;
      return acc;
    }
    
    acc[token] = getStrategyTvl(networkInfo.address, networkInfo.strategyAddress, provider);

    return acc;
  }, {} as TokenRecord<Promise<number> | null>);

  return {
    stEth: await results.stEth,
    rEth: await results.rEth,
    cbEth: await results.cbEth,
    beacon: await results.beacon,
  };
}

export function useTotalStakedTokens(network: SupportedNetwork): UseQueryResult<TokenRecord<number | null>> {
  const result = useQuery({
    queryKey: ["totalStakedTokens", network],
    queryFn: () => queryTotalStakedTokens(network),
    retry: false,
  });

  return result;
}
  