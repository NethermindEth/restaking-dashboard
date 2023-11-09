import moment from "moment";
import { useState, useEffect } from 'react';
import { ApiDepositsResponse, ApiDepositsEntry } from "@/app/utils/api/deposits";
import { TimeRange, TokenRecord } from "@/app/utils/types";

function keysOf<T extends Object>(obj: T): Array<keyof T> {
  return Array.from(Object.keys(obj)) as any;
}

function groupDepositsByTime(data: ApiDepositsResponse | undefined, timeRange: TimeRange): ApiDepositsResponse | undefined {
  if (timeRange === "daily" || data === undefined) {
    return data
  }
  
  const result = {
    timestamps: [],
    deposits: {} as TokenRecord<ApiDepositsEntry[] | null>
  };

  keysOf(data.deposits).forEach(token => data.deposits[token] === null && delete data.deposits[token]);

  keysOf(data.deposits).forEach(token => {
    result.deposits[token] = [];
  });

  let currentTime = '';
  let timelyData = {} as TokenRecord<ApiDepositsEntry | null>;

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
        keysOf(data.deposits).forEach(token => {
          result.deposits[token]!.push({
            totalAmount: timelyData[token]!.totalAmount,
            totalShares: timelyData[token]!.totalShares,
            cumulativeAmount: timelyData[token]!.cumulativeAmount,
            cumulativeShares: timelyData[token]!.cumulativeShares
          });
        });
      }

      currentTime = time;
      timelyData = {} as TokenRecord<ApiDepositsEntry | null>;;

      keysOf(data.deposits).forEach(token => {
        timelyData[token] = {
          totalAmount: 0,
          totalShares: 0,
          cumulativeAmount: 0,
          cumulativeShares: 0
        };
      });
    }

    keysOf(data.deposits).forEach(token => {
      const entry = data.deposits[token]![i];
      timelyData[token]!.totalAmount += entry.totalAmount;
      timelyData[token]!.totalShares += entry.totalShares;
      timelyData[token]!.cumulativeAmount = entry.cumulativeAmount;
      timelyData[token]!.cumulativeShares = entry.cumulativeShares;
    });

    if (i === data.timestamps.length - 1) {
      result.timestamps.push(currentTime as never);
      keysOf(data.deposits).forEach(token => {
        result.deposits[token]!.push({
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

const useDepositsGrouping = (rawData: ApiDepositsResponse | undefined, timeRange: TimeRange): { data: ApiDepositsResponse | undefined } => {
  const [result, setResult] = useState<ApiDepositsResponse | undefined>(rawData);

  useEffect(() => {
    setResult(groupDepositsByTime(rawData, timeRange));
  }, [rawData, timeRange]);

  return { data: result };
};

export default useDepositsGrouping;