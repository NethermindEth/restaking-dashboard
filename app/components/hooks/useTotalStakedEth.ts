import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { SupportedNetwork, TokenRecord } from "@/app/utils";
import { useShareRates } from "./useShareRates";
import { useTotalStakedTokens } from "./useTotalStakedTokens";

export function useTotalStakedEth(network: SupportedNetwork): UseQueryResult<TokenRecord<number | null>> {
  const { data: rates } = useShareRates(network);
  const { data: totalStakedTokens } = useTotalStakedTokens(network);

  const result = useQuery({
    queryKey: ["totalStakedEth", network, rates, totalStakedTokens],
    queryFn: async () => {
      if (!rates) throw new Error("Rates were not yet fetched");
      if (!totalStakedTokens) throw new Error("Total staked tokens were not yet fetched");

      return {
        stEth: totalStakedTokens.stEth ? totalStakedTokens.stEth * rates.stEth! : null,
        rEth: totalStakedTokens.rEth ? totalStakedTokens.rEth * rates.rEth! : null,
        cbEth: totalStakedTokens.cbEth ? totalStakedTokens.cbEth * rates.cbEth! : null,
        beacon: totalStakedTokens.beacon,
      };
    },
    enabled: !!rates && !!totalStakedTokens,
  });

  return result;
}
  