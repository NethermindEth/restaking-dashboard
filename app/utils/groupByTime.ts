import moment from "moment";
import { ApiDepositsResponse, ApiDepositsEntry } from "@/app/utils/api/deposits";
import { ApiWithdrawalsResponse, ApiWithdrawalsEntry } from "@/app/utils/api/withdrawals";
import { TimeRange, TokenRecord } from "@/app/utils/types";

export function groupDepositsByTime(data: ApiDepositsResponse, timeRange: TimeRange): ApiDepositsResponse {
  if (timeRange === "daily") {
    return data
  }
  const result = {
    timestamps: [],
    deposits: {} as TokenRecord<ApiDepositsEntry[] | null>
  };

  Object.keys(data.deposits).forEach(token => data.deposits[token as keyof TokenRecord<ApiDepositsEntry[] | null>] === null && delete data.deposits[token as keyof TokenRecord<ApiDepositsEntry[] | null>]);

  Object.keys(data.deposits).forEach(token => {
    result.deposits[token as keyof TokenRecord<ApiDepositsEntry[] | null>] = [];
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
        Object.keys(data.deposits).forEach(token => {
          result.deposits[token as keyof TokenRecord<ApiDepositsEntry[] | null>]!.push({
            totalAmount: timelyData[token as keyof TokenRecord<ApiDepositsEntry[] | null>]!.totalAmount,
            totalShares: timelyData[token as keyof TokenRecord<ApiDepositsEntry[] | null>]!.totalShares,
            cumulativeAmount: timelyData[token as keyof TokenRecord<ApiDepositsEntry[] | null>]!.cumulativeAmount,
            cumulativeShares: timelyData[token as keyof TokenRecord<ApiDepositsEntry[] | null>]!.cumulativeShares
          });
        });
      }

      currentTime = time;
      timelyData = {} as TokenRecord<ApiDepositsEntry | null>;;

      Object.keys(data.deposits).forEach(token => {
        timelyData[token as keyof TokenRecord<ApiDepositsEntry[] | null>] = {
          totalAmount: 0,
          totalShares: 0,
          cumulativeAmount: 0,
          cumulativeShares: 0
        };
      });
    }

    Object.keys(data.deposits).forEach(token => {
      const entry = data.deposits[token as keyof TokenRecord<ApiDepositsEntry[] | null>]![i];
      timelyData[token as keyof TokenRecord<ApiDepositsEntry[] | null>]!.totalAmount += entry.totalAmount;
      timelyData[token as keyof TokenRecord<ApiDepositsEntry[] | null>]!.totalShares += entry.totalShares;
      timelyData[token as keyof TokenRecord<ApiDepositsEntry[] | null>]!.cumulativeAmount = entry.cumulativeAmount;
      timelyData[token as keyof TokenRecord<ApiDepositsEntry[] | null>]!.cumulativeShares = entry.cumulativeShares;
    });

    if (i === data.timestamps.length - 1) {
      result.timestamps.push(currentTime as never);
      Object.keys(data.deposits).forEach(token => {
        result.deposits[token as keyof TokenRecord<ApiDepositsEntry[] | null>]!.push({
          totalAmount: timelyData[token as keyof TokenRecord<ApiDepositsEntry[] | null>]!.totalAmount,
          totalShares: timelyData[token as keyof TokenRecord<ApiDepositsEntry[] | null>]!.totalShares,
          cumulativeAmount: timelyData[token as keyof TokenRecord<ApiDepositsEntry[] | null>]!.cumulativeAmount,
          cumulativeShares: timelyData[token as keyof TokenRecord<ApiDepositsEntry[] | null>]!.cumulativeShares
        });
      });
    }
  });

  return result;
}

export function groupWithdrawalsByTime(data: ApiWithdrawalsResponse, timeRange: TimeRange): ApiWithdrawalsResponse {
  if (timeRange === "daily") {
    return data
  }
  const result = {
    timestamps: [],
    withdrawals: {} as TokenRecord<ApiWithdrawalsEntry[] | null>
  };

  Object.keys(data.withdrawals).forEach(token => data.withdrawals[token as keyof TokenRecord<ApiDepositsEntry[] | null>] === null && delete data.withdrawals[token as keyof TokenRecord<ApiDepositsEntry[] | null>]);

  Object.keys(data.withdrawals).forEach(token => {
    result.withdrawals[token as keyof TokenRecord<ApiWithdrawalsEntry[] | null>] = [];
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
        Object.keys(data.withdrawals).forEach(token => {
          result.withdrawals[token as keyof TokenRecord<ApiWithdrawalsEntry[] | null>]!.push({
            totalAmount: timelyData[token as keyof TokenRecord<ApiWithdrawalsEntry[] | null>]!.totalAmount,
            totalShares: timelyData[token as keyof TokenRecord<ApiWithdrawalsEntry[] | null>]!.totalShares,
            cumulativeAmount: timelyData[token as keyof TokenRecord<ApiWithdrawalsEntry[] | null>]!.cumulativeAmount,
            cumulativeShares: timelyData[token as keyof TokenRecord<ApiWithdrawalsEntry[] | null>]!.cumulativeShares
          });
        });
      }

      currentTime = time;
      timelyData = {} as TokenRecord<ApiWithdrawalsEntry | null>;;

      Object.keys(data.withdrawals).forEach(token => {
        timelyData[token as keyof TokenRecord<ApiWithdrawalsEntry[] | null>] = {
          totalAmount: 0,
          totalShares: 0,
          cumulativeAmount: 0,
          cumulativeShares: 0
        };
      });
    }

    Object.keys(data.withdrawals).forEach(token => {
      const entry = data.withdrawals[token as keyof TokenRecord<ApiWithdrawalsEntry[] | null>]![i];
      timelyData[token as keyof TokenRecord<ApiWithdrawalsEntry[] | null>]!.totalAmount += entry.totalAmount;
      timelyData[token as keyof TokenRecord<ApiWithdrawalsEntry[] | null>]!.totalShares += entry.totalShares;
      timelyData[token as keyof TokenRecord<ApiWithdrawalsEntry[] | null>]!.cumulativeAmount = entry.cumulativeAmount;
      timelyData[token as keyof TokenRecord<ApiWithdrawalsEntry[] | null>]!.cumulativeShares = entry.cumulativeShares;
    });

    if (i === data.timestamps.length - 1) {
      result.timestamps.push(currentTime as never);
      Object.keys(data.withdrawals).forEach(token => {
        result.withdrawals[token as keyof TokenRecord<ApiWithdrawalsEntry[] | null>]!.push({
          totalAmount: timelyData[token as keyof TokenRecord<ApiWithdrawalsEntry[] | null>]!.totalAmount,
          totalShares: timelyData[token as keyof TokenRecord<ApiWithdrawalsEntry[] | null>]!.totalShares,
          cumulativeAmount: timelyData[token as keyof TokenRecord<ApiWithdrawalsEntry[] | null>]!.cumulativeAmount,
          cumulativeShares: timelyData[token as keyof TokenRecord<ApiWithdrawalsEntry[] | null>]!.cumulativeShares
        });
      });
    }
  });

  return result;
}