import { ethers } from "ethers";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { IERC20__factory } from "@/typechain";
import { SupportedNetwork, TokenRecord, supportedTokens } from "@/app/utils";
import { getNetworkTokens, getNetworkProvider } from "@/app/constants";
import { getTotalStakedBeacon } from "@/app/utils/api/totalStakedBeacon";

async function getStrategyTvl(tokenAddress: `0x${string}`, strategyAddress: `0x${string}`, provider: ethers.Provider): Promise<number> {
  const token = IERC20__factory.connect(tokenAddress, provider);

  return Number(await token.balanceOf(strategyAddress)) / 1e18;
}

export function useTotalStakedTokens(network: SupportedNetwork): UseQueryResult<TokenRecord<number | null>> {
  const result = useQuery({
    queryKey: ["totalStakedTokens", network],
    queryFn: async () => {
      const networkTokens = getNetworkTokens(network);
      const provider = getNetworkProvider(network);
      
      const results = supportedTokens.reduce((acc, token) => {
        if (token == "beacon") {
          acc[token] = getTotalStakedBeacon(network).then(({ data }) => data.totalStakedBeacon);
          return acc;
        }

        const networkToken = networkTokens[token];

        if (!networkToken) {
          acc[token] = null;
          return acc;
        }
        
        acc[token] = getStrategyTvl(networkToken.address, networkToken.strategyAddress, provider);

        return acc;
      }, {} as TokenRecord<Promise<number> | null>);

      return {
        stEth: await results.stEth,
        rEth: await results.rEth,
        cbEth: await results.cbEth,
        beacon: await results.beacon,
      };
    },
    retry: false,
  });

  return result;
}
  