create type mainnet."WithdrawalData" as (
    depositor bytea,
    nonce integer,
    block integer
);

create type mainnet."RatesUpdateData" as (
    block integer,
    strategy bytea,
    rate numeric
);

create or replace function mainnet.share_withdrawal_strategies(p_rows mainnet."WithdrawalData"[])
returns table (block integer, strategy text) as $$
begin
  return query 
  select distinct (v).block as block, '0x' || encode(s.strategy, 'hex') as strategy
  from mainnet."ShareWithdrawals" s
  inner join unnest(p_rows) v on s.depositor = (v).depositor and s.nonce = (v).nonce;
end;
$$ language plpgsql;

create or replace function mainnet.update_share_withdrawals(
    p_withdrawal_data mainnet."WithdrawalData"[], 
    p_rates_data mainnet."RatesUpdateData"[],
    p_block integer
)
returns void as $$
declare
    p_withdrawal_data_row mainnet."WithdrawalData";
    p_rates_data_row mainnet."RatesUpdateData";
begin
    foreach p_withdrawal_data_row in array p_withdrawal_data
    loop
        update mainnet."ShareWithdrawals"
        set
            withdraw_block = p_withdrawal_data_row.block
        where 
            depositor = p_withdrawal_data_row.depositor and 
            nonce = p_withdrawal_data_row.nonce;
    end loop;

    foreach p_rates_data_row in array p_rates_data
    loop
        update mainnet."ShareWithdrawals"
        set 
            amount = floor(p_rates_data_row.rate * shares / 1e22)
        where 
            withdraw_block = p_rates_data_row.block and
            strategy = p_rates_data_row.strategy;
    end loop;

    update mainnet."LastIndexingStates"
    set state = p_block
    where key = 'Withdrawals';
end; $$
language plpgsql;

create or replace function mainnet.index_deposits(
    p_rows mainnet."Deposits"[], 
    p_block integer
) 
returns void as $$
begin
    insert into mainnet."Deposits" 
    (depositor, amount, block, log_index, strategy, shares, caller) 
    select
      (v).depositor, 
      (v).amount, 
      (v).block, 
      (v).log_index, 
      (v).strategy, 
      (v).shares, 
      (v).caller
    from unnest(p_rows) v
    on conflict on constraint "Deposits_tx_key" do nothing;
    
    update mainnet."LastIndexingStates"
    set state = p_block
    where key = 'Deposits';
end;
$$ language plpgsql;

create or replace function mainnet.index_pods(
    p_rows mainnet."Pods"[], 
    p_block integer
) 
returns void as $$
begin
    insert into mainnet."Pods" 
    (block, address, owner)
    select
      (v).block, 
      (v).address, 
      (v).owner
    from unnest(p_rows) v
    on conflict on constraint "Pods_address_key" do nothing;
    
    update mainnet."LastIndexingStates" 
    set state = p_block 
    where key = 'Pods';
end;
$$ language plpgsql;

create or replace function mainnet.index_share_withdrawals(
    p_rows mainnet."ShareWithdrawals"[],
    p_block integer
) 
returns void as $$
begin
    insert into mainnet."ShareWithdrawals" 
    (depositor, nonce, strategy, shares, log_index, queued_block, withdrawer, delegated_address)
    select
      (v).depositor, 
      (v).nonce, 
      (v).strategy, 
      (v).shares,
      (v).log_index, 
      (v).queued_block, 
      (v).withdrawer, 
      (v).delegated_address
    from unnest(p_rows) v
    on conflict on constraint "ShareWithdrawals_block_log_index_key" do nothing;
    
    update mainnet."LastIndexingStates" 
    set state = p_block 
    where key = 'QueuedWithdrawals';
end;
$$ language plpgsql;

create or replace function mainnet.index_validators(p_rows mainnet."Validators"[], p_index integer)
returns void as $$
begin
  insert into mainnet."Validators" (index, pubkey, balance, withdrawal_address, effective_balance, activation_eligibility_epoch, exit_epoch, slashed)
  select 
    (v).index, 
    (v).pubkey, 
    (v).balance, 
    (v).withdrawal_address, 
    (v).effective_balance, 
    (v).activation_eligibility_epoch, 
    (v).exit_epoch,
    (v).slashed
  from unnest(p_rows) v
  where exists (select 1 from mainnet."Pods" where address = (v).withdrawal_address)
  on conflict (index) do update 
  set 
    pubkey = excluded.pubkey,
    balance = excluded.balance,
    withdrawal_address = excluded.withdrawal_address,
    effective_balance = excluded.effective_balance,
    activation_eligibility_epoch = excluded.activation_eligibility_epoch,
    exit_epoch = excluded.exit_epoch,
    slashed = excluded.slashed;

  update mainnet."LastIndexingStates"
  set state = p_index
  where key = 'Validators';
end;
$$ language plpgsql;
