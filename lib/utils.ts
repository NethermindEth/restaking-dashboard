export interface DailyTokenData {
  date: string;
  total_amount: number;
  total_shares: number;
  cumulative_amount: number;
  cumulative_shares: number;
}

export interface LeaderboardUserData {
  depositor: string;
  totalStaked: number;
}

export interface DepositStakersData {
  stEthDeposits: LeaderboardUserData[];
  cbEthDeposits: LeaderboardUserData[];
  rEthDeposits: LeaderboardUserData[];
}

export interface DailyTokenWithdrawals {
  date: string | null;
  total_amount: number | null;
  total_shares: number | null;
}

export interface Deposits {
  stEthDeposits: DailyTokenData[];
  cbEthDeposits: DailyTokenData[];
  rEthDeposits: DailyTokenData[];
  beaconChainDeposits: DailyTokenData[];
}

export interface Withdrawls {
  stEthWithdrawls: DailyTokenData[];
  cbEthWithdrawls: DailyTokenData[];
  rEthWithdrawls: DailyTokenData[];
  beaconChainWithdrawls: DailyTokenData[];
}

export function roundToDecimalPlaces(
  value: number,
  decimalPlaces: number = 2
): number | string {
  // const factor = Math.pow(10, decimalPlaces);
  // return Math.round(value * factor) / factor;
  return value.toFixed(decimalPlaces);
}

export function formatDateToStandard(inputDate: string): string {
  const date = new Date(inputDate);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);

  return `${day}/${month}/${year}`;
}

export function extractAmountsAndTimestamps(
  cumulative: boolean,
  ...data: DailyTokenData[][]
): {
  amounts: number[][];
  timestamps: string[];
} {
  const amounts = data.map((tokenData) =>
    tokenData.map((el) =>
      cumulative ? el.cumulative_amount! : el.total_amount!
    )
  );

  const dates = data
    .map((tokenData) => tokenData.map((el) => el.date))
    .sort((a, b) => a.length - b.length)[0];

  return { amounts, timestamps: dates.map((el) => formatDateToStandard(el!)) };
}

export function getEtherscanAddressUrl(address: string): string {
  return `https://etherscan.io/address/${address}`;
}

export function getShortenedAddress(
  address: string,
  first: number,
  second: number
) {
  return `${address?.slice(0, first)}...${address.slice(-1 * second)}`;
}
