import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { TimeRange } from "@/app/utils/types";
import { ApiDepositsResponse } from "@/app/utils/api/deposits";
import { groupDepositsByTime } from "@/app/utils/groupByTime";

export function getGroupingQueryKey(data: ApiDepositsResponse | undefined, timeRange: TimeRange): any[] {
  return ["deposits", data, timeRange];
}

export async function queryGrouping(data: ApiDepositsResponse | undefined, timeRange: TimeRange, _: boolean = false): Promise<ApiDepositsResponse | undefined> {
  return groupDepositsByTime(data, timeRange)
}

export function useDepositsGrouping(data: ApiDepositsResponse | undefined, timeRange: TimeRange): UseQueryResult<ApiDepositsResponse | undefined> {
  const result = useQuery({
    queryKey: getGroupingQueryKey(data, timeRange),
    queryFn: () => queryGrouping(data, timeRange),
    retry: false,
  });

  return result;
}
