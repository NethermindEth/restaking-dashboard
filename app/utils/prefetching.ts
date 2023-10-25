import { QueryClient } from "@tanstack/react-query";
import { supportedNetworks } from "@/app/utils/types";
import { prefetchingGetShareRatesQueryKey, prefetchingQueryShareRates } from "@/app/components/hooks/useShareRates";
import { prefetchingGetTotalStakedTokensQueryKey, prefetchingQueryTotalStakedTokens } from "@/app/components/hooks/useTotalStakedTokens";
import { prefetchingGetDepositsQueryKey, prefetchingQueryDeposits } from "@/app/components/hooks/useDeposits";
import { prefetchingGetLeaderboardQueryKey, prefetchingQueryLeaderboard } from "@/app/components/hooks/useLeaderboard";
import { prefetchingGetTotalStakedEthQueryKey, prefetchingQueryTotalStakedEth } from "@/app/components/hooks/useTotalStakedEth";
import { prefetchingGetWithdrawalsQueryKey, prefetchingQueryWithdrawals } from "@/app/components/hooks/useWithdrawals";

export async function prefetchApiData(queryClient: QueryClient): Promise<void> {
  await Promise.all(supportedNetworks.map(async (network) => {
    await queryClient.prefetchQuery({
      queryKey: prefetchingGetShareRatesQueryKey(network, queryClient),
      queryFn: () => prefetchingQueryShareRates(network, queryClient),
    });

    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: prefetchingGetDepositsQueryKey(network, queryClient),
        queryFn: () => prefetchingQueryDeposits(network, queryClient),
      }),
      queryClient.prefetchQuery({
        queryKey: prefetchingGetLeaderboardQueryKey(network, queryClient),
        queryFn: () => prefetchingQueryLeaderboard(network, queryClient),
      }),
      queryClient.prefetchQuery({
        queryKey: prefetchingGetTotalStakedTokensQueryKey(network, queryClient),
        queryFn: () => prefetchingQueryTotalStakedTokens(network, queryClient),
      }).then(() => {
        return queryClient.prefetchQuery({
          queryKey: prefetchingGetTotalStakedEthQueryKey(network, queryClient),
          queryFn: () => prefetchingQueryTotalStakedEth(network, queryClient),
        });
      }),
      queryClient.prefetchQuery({
        queryKey: prefetchingGetWithdrawalsQueryKey(network, queryClient),
        queryFn: () => prefetchingQueryWithdrawals(network, queryClient),
      }),
    ]);
  }));
}
