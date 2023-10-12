export interface DailyTokenData {
  date: string;
  total_amount: number;
  total_shares: number;
  cumulative_amount: number;
  cumulative_shares: number;
}

export interface DailyTokenWithdrawals {
  date: string | null;
  total_amount: number | null;
  total_shares: number | null;
}

export interface LeaderboardUserData {
  depositor: string;
  totalStaked: number;
}
