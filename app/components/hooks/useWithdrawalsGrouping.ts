import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { TimeRange } from "@/app/utils/types";
import { ApiWithdrawalsResponse } from "@/app/utils/api/withdrawals";
import { groupWithdrawalsByTime } from "@/app/utils/groupByTime";

export function getGroupingQueryKey(data: ApiWithdrawalsResponse | undefined, timeRange: TimeRange): any[] {
  return ["withdrawals", data, timeRange];
}

export async function queryGrouping(data: ApiWithdrawalsResponse | undefined, timeRange: TimeRange, _: boolean = false): Promise<ApiWithdrawalsResponse | undefined> {
  return groupWithdrawalsByTime(data, timeRange)
}

export function useWithdrawalsGrouping(data: ApiWithdrawalsResponse | undefined, timeRange: TimeRange): UseQueryResult<ApiWithdrawalsResponse | undefined> {
  const result = useQuery({
    queryKey: getGroupingQueryKey(data, timeRange),
    queryFn: () => queryGrouping(data, timeRange),
    retry: false,
  });

  return result;
}
