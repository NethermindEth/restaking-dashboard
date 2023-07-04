export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  mainnet: {
    Tables: {
      Deposits: {
        Row: {
          amount: number;
          block: number;
          caller: string;
          created_at: string;
          depositor: string;
          id: number;
          log_index: number;
          shares: number;
          strategy: string;
        };
        Insert: {
          amount: number;
          block: number;
          caller: string;
          created_at?: string;
          depositor: string;
          id?: number;
          log_index: number;
          shares: number;
          strategy: string;
        };
        Update: {
          amount?: number;
          block?: number;
          caller?: string;
          created_at?: string;
          depositor?: string;
          id?: number;
          log_index?: number;
          shares?: number;
          strategy?: string;
        };
        Relationships: [];
      };
      LastIndexingStates: {
        Row: {
          id: number;
          key: string;
          state: number;
        };
        Insert: {
          id?: number;
          key: string;
          state: number;
        };
        Update: {
          id?: number;
          key?: string;
          state?: number;
        };
        Relationships: [];
      };
      Pods: {
        Row: {
          address: string;
          block: number;
          created_at: string | null;
          id: number;
          owner: string;
        };
        Insert: {
          address: string;
          block: number;
          created_at?: string | null;
          id?: number;
          owner: string;
        };
        Update: {
          address?: string;
          block?: number;
          created_at?: string | null;
          id?: number;
          owner?: string;
        };
        Relationships: [];
      };
      ShareWithdrawals: {
        Row: {
          amount: number | null;
          created_at: string;
          delegated_address: string | null;
          depositor: string;
          id: number;
          log_index: number;
          nonce: number;
          queued_block: number;
          shares: number;
          strategy: string;
          withdraw_block: number | null;
          withdrawer: string | null;
        };
        Insert: {
          amount?: number | null;
          created_at?: string;
          delegated_address?: string | null;
          depositor: string;
          id?: number;
          log_index: number;
          nonce: number;
          queued_block: number;
          shares: number;
          strategy: string;
          withdraw_block?: number | null;
          withdrawer?: string | null;
        };
        Update: {
          amount?: number | null;
          created_at?: string;
          delegated_address?: string | null;
          depositor?: string;
          id?: number;
          log_index?: number;
          nonce?: number;
          queued_block?: number;
          shares?: number;
          strategy?: string;
          withdraw_block?: number | null;
          withdrawer?: string | null;
        };
        Relationships: [];
      };
      Strategies: {
        Row: {
          address: string;
          name: string;
          token: string;
        };
        Insert: {
          address: string;
          name: string;
          token: string;
        };
        Update: {
          address?: string;
          name?: string;
          token?: string;
        };
        Relationships: [];
      };
      Validators: {
        Row: {
          activation_eligibility_epoch: number;
          balance: number;
          bls_epoch: number | null;
          created_at: string;
          effective_balance: number;
          exit_epoch: number;
          index: number;
          pubkey: string;
          slashed: boolean;
          withdrawal_address: string;
        };
        Insert: {
          activation_eligibility_epoch: number;
          balance: number;
          bls_epoch?: number | null;
          created_at?: string;
          effective_balance: number;
          exit_epoch: number;
          index: number;
          pubkey: string;
          slashed: boolean;
          withdrawal_address: string;
        };
        Update: {
          activation_eligibility_epoch?: number;
          balance?: number;
          bls_epoch?: number | null;
          created_at?: string;
          effective_balance?: number;
          exit_epoch?: number;
          index?: number;
          pubkey?: string;
          slashed?: boolean;
          withdrawal_address?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      CumulativeDailyBeaconChainETHDeposits: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      CumulativeDailyBeaconChainETHWithdrawals: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      CumulativeDailyCbETHDeposits: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      CumulativeDailyCbETHWithdrawals: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      CumulativeDailyRETHDeposits: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      CumulativeDailyRETHWithdrawals: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      CumulativeDailyStETHDeposits: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      CumulativeDailyStETHWithdrawals: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      DailyBeaconChainETHDeposits: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      DailyBeaconChainETHWithdrawals: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      DailyCbETHDeposits: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      DailyCbETHWithdrawals: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      DailyDeposits: {
        Row: {
          date: string | null;
          token: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      DailyRETHDeposits: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      DailyRETHWithdrawals: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      DailyStETHDeposits: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      DailyStETHWithdrawals: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      DailyWithdrawals: {
        Row: {
          date: string | null;
          token: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      StakedBeaconChainETH: {
        Row: {
          amount: number | null;
        };
        Relationships: [];
      };
      StakersBeaconChainETHShares: {
        Row: {
          depositor: string | null;
          total_staked_shares: number | null;
        };
        Relationships: [];
      };
      StakersCbETHShares: {
        Row: {
          depositor: string | null;
          total_staked_shares: number | null;
        };
        Relationships: [];
      };
      StakersRETHShares: {
        Row: {
          depositor: string | null;
          total_staked_shares: number | null;
        };
        Relationships: [];
      };
      StakersStETHShares: {
        Row: {
          depositor: string | null;
          total_staked_shares: number | null;
        };
        Relationships: [];
      };
      ValidatorsUnknownBlsEpoch: {
        Row: {
          activation_eligibility_epoch: number | null;
          index: number | null;
        };
        Insert: {
          activation_eligibility_epoch?: number | null;
          index?: number | null;
        };
        Update: {
          activation_eligibility_epoch?: number | null;
          index?: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      epoch_timestamp: {
        Args: {
          epoch_number: number;
        };
        Returns: string;
      };
      estimate_block_timestamp: {
        Args: {
          block_number: number;
        };
        Returns: string;
      };
      index_deposits: {
        Args: {
          p_rows: unknown[];
          p_block: number;
        };
        Returns: undefined;
      };
      index_pods: {
        Args: {
          p_rows: unknown[];
          p_block: number;
        };
        Returns: undefined;
      };
      index_share_withdrawals: {
        Args: {
          p_rows: unknown[];
          p_block: number;
        };
        Returns: undefined;
      };
      index_validators: {
        Args: {
          p_rows: unknown[];
          p_index: number;
        };
        Returns: undefined;
      };
      share_withdrawal_strategies: {
        Args: {
          p_rows: Database["mainnet"]["CompositeTypes"]["WithdrawalData"][];
        };
        Returns: {
          block: number;
          strategy: string;
        }[];
      };
      update_share_withdrawals: {
        Args: {
          p_withdrawal_data: Database["mainnet"]["CompositeTypes"]["WithdrawalData"][];
          p_rates_data: Database["mainnet"]["CompositeTypes"]["RatesUpdateData"][];
          p_block: number;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      RatesUpdateData: {
        block: number;
        strategy: string;
        rate: bigint;
      };
      WithdrawalData: {
        depositor: string;
        nonce: number;
        block: number;
      };
    };
  };
  goerli: {
    Tables: {
      Deposits: {
        Row: {
          amount: number;
          block: number;
          caller: string;
          created_at: string;
          depositor: string;
          id: number;
          log_index: number;
          shares: number;
          strategy: string;
        };
        Insert: {
          amount: number;
          block: number;
          caller: string;
          created_at?: string;
          depositor: string;
          id?: number;
          log_index: number;
          shares: number;
          strategy: string;
        };
        Update: {
          amount?: number;
          block?: number;
          caller?: string;
          created_at?: string;
          depositor?: string;
          id?: number;
          log_index?: number;
          shares?: number;
          strategy?: string;
        };
        Relationships: [];
      };
      LastIndexingStates: {
        Row: {
          id: number;
          key: string;
          state: number;
        };
        Insert: {
          id?: number;
          key: string;
          state: number;
        };
        Update: {
          id?: number;
          key?: string;
          state?: number;
        };
        Relationships: [];
      };
      Pods: {
        Row: {
          address: string;
          block: number;
          created_at: string | null;
          id: number;
          owner: string;
        };
        Insert: {
          address: string;
          block: number;
          created_at?: string | null;
          id?: number;
          owner: string;
        };
        Update: {
          address?: string;
          block?: number;
          created_at?: string | null;
          id?: number;
          owner?: string;
        };
        Relationships: [];
      };
      ShareWithdrawals: {
        Row: {
          amount: number | null;
          created_at: string;
          delegated_address: string | null;
          depositor: string;
          id: number;
          log_index: number;
          nonce: number;
          queued_block: number;
          shares: number;
          strategy: string;
          withdraw_block: number | null;
          withdrawer: string | null;
        };
        Insert: {
          amount?: number | null;
          created_at?: string;
          delegated_address?: string | null;
          depositor: string;
          id?: number;
          log_index: number;
          nonce: number;
          queued_block: number;
          shares: number;
          strategy: string;
          withdraw_block?: number | null;
          withdrawer?: string | null;
        };
        Update: {
          amount?: number | null;
          created_at?: string;
          delegated_address?: string | null;
          depositor?: string;
          id?: number;
          log_index?: number;
          nonce?: number;
          queued_block?: number;
          shares?: number;
          strategy?: string;
          withdraw_block?: number | null;
          withdrawer?: string | null;
        };
        Relationships: [];
      };
      Strategies: {
        Row: {
          address: string;
          name: string;
          token: string;
        };
        Insert: {
          address: string;
          name: string;
          token: string;
        };
        Update: {
          address?: string;
          name?: string;
          token?: string;
        };
        Relationships: [];
      };
      Validators: {
        Row: {
          activation_eligibility_epoch: number;
          balance: number;
          bls_epoch: number | null;
          created_at: string;
          effective_balance: number;
          exit_epoch: number;
          index: number;
          pubkey: string;
          slashed: boolean;
          withdrawal_address: string;
        };
        Insert: {
          activation_eligibility_epoch: number;
          balance: number;
          bls_epoch?: number | null;
          created_at?: string;
          effective_balance: number;
          exit_epoch: number;
          index: number;
          pubkey: string;
          slashed: boolean;
          withdrawal_address: string;
        };
        Update: {
          activation_eligibility_epoch?: number;
          balance?: number;
          bls_epoch?: number | null;
          created_at?: string;
          effective_balance?: number;
          exit_epoch?: number;
          index?: number;
          pubkey?: string;
          slashed?: boolean;
          withdrawal_address?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      CumulativeDailyBeaconChainETHDeposits: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      CumulativeDailyBeaconChainETHWithdrawals: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };

      CumulativeDailyRETHDeposits: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      CumulativeDailyRETHWithdrawals: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      CumulativeDailyStETHDeposits: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      CumulativeDailyStETHWithdrawals: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      DailyBeaconChainETHDeposits: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      DailyBeaconChainETHWithdrawals: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };

      DailyDeposits: {
        Row: {
          date: string | null;
          token: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      DailyRETHDeposits: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      DailyRETHWithdrawals: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      DailyStETHDeposits: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      DailyStETHWithdrawals: {
        Row: {
          date: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      DailyWithdrawals: {
        Row: {
          date: string | null;
          token: string | null;
          total_amount: number | null;
          total_shares: number | null;
        };
        Relationships: [];
      };
      StakedBeaconChainETH: {
        Row: {
          amount: number | null;
        };
        Relationships: [];
      };
      StakersBeaconChainETHShares: {
        Row: {
          depositor: string | null;
          total_staked_shares: number | null;
        };
        Relationships: [];
      };

      StakersRETHShares: {
        Row: {
          depositor: string | null;
          total_staked_shares: number | null;
        };
        Relationships: [];
      };
      StakersStETHShares: {
        Row: {
          depositor: string | null;
          total_staked_shares: number | null;
        };
        Relationships: [];
      };
      ValidatorsUnknownBlsEpoch: {
        Row: {
          activation_eligibility_epoch: number | null;
          index: number | null;
        };
        Insert: {
          activation_eligibility_epoch?: number | null;
          index?: number | null;
        };
        Update: {
          activation_eligibility_epoch?: number | null;
          index?: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      epoch_timestamp: {
        Args: {
          epoch_number: number;
        };
        Returns: string;
      };
      estimate_block_timestamp: {
        Args: {
          block_number: number;
        };
        Returns: string;
      };
      index_deposits: {
        Args: {
          p_rows: unknown[];
          p_block: number;
        };
        Returns: undefined;
      };
      index_pods: {
        Args: {
          p_rows: unknown[];
          p_block: number;
        };
        Returns: undefined;
      };
      index_share_withdrawals: {
        Args: {
          p_rows: unknown[];
          p_block: number;
        };
        Returns: undefined;
      };
      index_validators: {
        Args: {
          p_rows: unknown[];
          p_index: number;
        };
        Returns: undefined;
      };
      share_withdrawal_strategies: {
        Args: {
          p_rows: Database["mainnet"]["CompositeTypes"]["WithdrawalData"][];
        };
        Returns: {
          block: number;
          strategy: string;
        }[];
      };
      update_share_withdrawals: {
        Args: {
          p_withdrawal_data: Database["mainnet"]["CompositeTypes"]["WithdrawalData"][];
          p_rates_data: Database["mainnet"]["CompositeTypes"]["RatesUpdateData"][];
          p_block: number;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      RatesUpdateData: {
        block: number;
        strategy: string;
        rate: bigint;
      };
      WithdrawalData: {
        depositor: string;
        nonce: number;
        block: number;
      };
    };
  };
}
