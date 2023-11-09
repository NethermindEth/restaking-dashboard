import moment from "moment";
import { useState, useEffect } from 'react';
import { ApiWithdrawalsResponse, ApiWithdrawalsEntry } from "@/app/utils/api/withdrawals";
import { TimeRange, TokenRecord } from "@/app/utils/types";

function keysOf<T extends Object>(obj: T): Array<keyof T> {
  return Array.from(Object.keys(obj)) as any;
}

export function groupWithdrawalsByTime(data: ApiWithdrawalsResponse | undefined, timeRange: TimeRange): ApiWithdrawalsResponse | undefined {
  if (timeRange === "daily" || data === undefined) {
    return data
  }
  const result = {
    timestamps: [],
    withdrawals: {} as TokenRecord<ApiWithdrawalsEntry[] | null>
  };

  keysOf(data.withdrawals).forEach(token => data.withdrawals[token] === null && delete data.withdrawals[token]);

  keysOf(data.withdrawals).forEach(token => {
    result.withdrawals[token] = [];
  });

  let currentTime = '';
  let timelyData = {} as TokenRecord<ApiWithdrawalsEntry | null>;

  data.timestamps.forEach((timestamp, i) => {
    const entryDate = moment(timestamp);

    let time

    if (timeRange === "weekly") {
      // const weekStart = entryDate.clone().startOf('week');
      // const weekEnd = entryDate.clone().endOf('week');
      // time = `${weekStart.format('YYYY-MM-DD')} to ${weekEnd.format('YYYY-MM-DD')}`;
      time = entryDate.clone().startOf('week').format('YYYY-MM-DD');
    } else if (timeRange === "monthly") {
      time = entryDate.format('MMMM YYYY');
    } else {
      throw Error("Invalid time range")
    }

    if (time !== currentTime) {
      if (currentTime !== '') {
        result.timestamps.push(currentTime as never);
        keysOf(data.withdrawals).forEach(token => {
          result.withdrawals[token]!.push({
            totalAmount: timelyData[token]!.totalAmount,
            totalShares: timelyData[token]!.totalShares,
            cumulativeAmount: timelyData[token]!.cumulativeAmount,
            cumulativeShares: timelyData[token]!.cumulativeShares
          });
        });
      }

      currentTime = time;
      timelyData = {} as TokenRecord<ApiWithdrawalsEntry | null>;;

      keysOf(data.withdrawals).forEach(token => {
        timelyData[token] = {
          totalAmount: 0,
          totalShares: 0,
          cumulativeAmount: 0,
          cumulativeShares: 0
        };
      });
    }

    keysOf(data.withdrawals).forEach(token => {
      const entry = data.withdrawals[token]![i];
      timelyData[token]!.totalAmount += entry.totalAmount;
      timelyData[token]!.totalShares += entry.totalShares;
      timelyData[token]!.cumulativeAmount = entry.cumulativeAmount;
      timelyData[token]!.cumulativeShares = entry.cumulativeShares;
    });

    if (i === data.timestamps.length - 1) {
      result.timestamps.push(currentTime as never);
      keysOf(data.withdrawals).forEach(token => {
        result.withdrawals[token]!.push({
          totalAmount: timelyData[token]!.totalAmount,
          totalShares: timelyData[token]!.totalShares,
          cumulativeAmount: timelyData[token]!.cumulativeAmount,
          cumulativeShares: timelyData[token]!.cumulativeShares
        });
      });
    }
  });

  return result;
}

const useWithdrawalsGrouping = (rawData: ApiWithdrawalsResponse | undefined, timeRange: TimeRange): { data: ApiWithdrawalsResponse | undefined } => {
  const [result, setResult] = useState<ApiWithdrawalsResponse | undefined>(rawData);

  useEffect(() => {
    setResult(groupWithdrawalsByTime(rawData, timeRange));
  }, [rawData, timeRange]);

  return { data: result };
};

export default useWithdrawalsGrouping;