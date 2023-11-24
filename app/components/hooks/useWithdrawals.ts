import { QueryClient, UseQueryResult, useQuery, useQueryClient } from "@tanstack/react-query";

import { SupportedNetwork, Timeline, supportedTimelines, timelineToDays } from "@/app/utils/types";
import { ApiWithdrawalsResponse, getWithdrawals } from "@/app/utils/api/withdrawals";

function getWithdrawalsQueryKey(network: SupportedNetwork, timeline: Timeline): any[] {
  return ["withdrawals", network, timeline];
}

async function queryWithdrawals(network: SupportedNetwork, timeline: Timeline, queryClient: QueryClient): Promise<ApiWithdrawalsResponse> {
  const higherTimelines = supportedTimelines.slice(supportedTimelines.indexOf(timeline));
  const entryCount = timelineToDays[timeline];

  for (const higherTimeline of higherTimelines) {
    const data: ApiWithdrawalsResponse | undefined = queryClient.getQueryData(getWithdrawalsQueryKey(network, higherTimeline));

    if (data) {
      return {
        withdrawals: Object.fromEntries(Object.entries(data.withdrawals).map(([tokenName, tokenWithdrawals]) => [tokenName, tokenWithdrawals?.slice(-entryCount)])) as any,
        timestamps: data.timestamps.slice(-entryCount),
      };
    }
  }

  return await getWithdrawals(network, timeline);
}

export default function useWithdrawals(network: SupportedNetwork, timeline: Timeline): UseQueryResult<ApiWithdrawalsResponse> {
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: getWithdrawalsQueryKey(network, timeline),
    queryFn: () => queryWithdrawals(network, timeline, queryClient),
    retry: false,
  });

  return result;
}
