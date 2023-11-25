import { QueryClient, UseQueryResult, useQuery, useQueryClient } from "@tanstack/react-query";

import { SupportedNetwork, SupportedTimeline, timelineToDays, supportedTimelines } from "@/app/utils/types";
import { ApiDepositsResponse, getDeposits } from "@/app/utils/api/deposits";

function getDepositsQueryKey(network: SupportedNetwork, timeline: SupportedTimeline): any[] {
  return ["deposits", network, timeline];
}

async function queryDeposits(network: SupportedNetwork, timeline: SupportedTimeline, queryClient: QueryClient): Promise<ApiDepositsResponse> {
  const higherTimelines = supportedTimelines.slice(supportedTimelines.indexOf(timeline));
  const entryCount = timelineToDays[timeline];

  for (const higherTimeline of higherTimelines) {
    const data: ApiDepositsResponse | undefined = queryClient.getQueryData(getDepositsQueryKey(network, higherTimeline));

    if (data) {
      return {
        deposits: Object.fromEntries(Object.entries(data.deposits).map(([tokenName, tokenDeposits]) => [tokenName, tokenDeposits?.slice(-entryCount)])) as any,
        timestamps: data.timestamps.slice(-entryCount),
      };
    }
  }

  return await getDeposits(network, timeline);
}

export default function useDeposits(network: SupportedNetwork, timeline: SupportedTimeline): UseQueryResult<ApiDepositsResponse> {
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: getDepositsQueryKey(network, timeline),
    queryFn: () => queryDeposits(network, timeline, queryClient),
    retry: false,
  });

  return result;
}
