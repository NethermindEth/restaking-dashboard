import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import Image from "next/image";
import Data from "./components/Data";
import Disclaimer from "./components/Disclaimer";
import { supportedNetworks } from "./utils/types";
import { prefetchingGetShareRatesQueryKey, prefetchingQueryShareRates } from "./components/hooks/useShareRates";
import { prefetchingGetTotalStakedTokensQueryKey, prefetchingQueryTotalStakedTokens } from "./components/hooks/useTotalStakedTokens";
import { prefetchingGetDepositsQueryKey, prefetchingQueryDeposits } from "./components/hooks/useDeposits";
import { prefetchingGetLeaderboardQueryKey, prefetchingQueryLeaderboard } from "./components/hooks/useLeaderboard";
import { prefetchingGetTotalStakedEthQueryKey, prefetchingQueryTotalStakedEth } from "./components/hooks/useTotalStakedEth";
import { prefetchingGetWithdrawalsQueryKey, prefetchingQueryWithdrawals } from "./components/hooks/useWithdrawals";

export default async function Home() {
  const queryClient = new QueryClient();

  // prefetching data for static site generation
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

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex min-h-screen flex-col items-center justify-between p-8 md:p-24 font-semibold">
        <div>
          <div className="z-10 max-w-5xl items-center justify-between font-mono text-sm">
            <div className="h-48 flex w-full items-center justify-center lg:static lg:h-auto lg:w-auto lg:bg-none lgmb-12">
              <Image
                src={"/logo.png"}
                alt="EigenLayer Logo"
                width={64}
                height={72}
              />
              <p className="text-lg md:text-2xl ml-4">EigenLayer Stats</p>
            </div>
          </div>
        </div>
        <Data />
        <div className="mt-32">
          <p className="flex items-center">
            <span className="pr-2">Made with ❤️ at Nethermind </span>
            <Image
              src={"/nethermind.png"}
              width={32}
              height={32}
              alt={"Nethermind logo"}
              style={{ display: "inline-block" }}
            />
          </p>
          <Disclaimer />
        </div>
      </main>
    </HydrationBoundary>
  );
}
