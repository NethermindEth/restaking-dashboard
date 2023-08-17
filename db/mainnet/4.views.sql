create view mainnet."ValidatorsUnknownBlsEpoch" as
  select index, activation_eligibility_epoch from mainnet."Validators"
  where bls_epoch is null;

create view
  mainnet."DailyDeposits" as
with
  min_block as (
    select min(block) as first_block from mainnet."Deposits"
  ),
  distinct_tokens as (
    select distinct token from mainnet."Strategies"
    union
    select null::bytea
  ),
  date_tokens as (
    select
      generate_series(
        mainnet.estimate_block_timestamp(min_block.first_block),
        current_date + '1 day'::interval,
        '1 day'::interval
      )::date as "date",
      distinct_tokens.token
    from
      min_block, distinct_tokens
  ),
  deposit_data as (
    select
      date(mainnet.estimate_block_timestamp(block)) as "date",
      token,
      sum(amount)::double precision / (10::double precision ^ 18::double precision) as total_amount,
      sum(shares)::double precision / (10::double precision ^ 18::double precision) as total_shares
    from
      mainnet."Deposits" inner join mainnet."Strategies" on mainnet."Deposits".strategy = mainnet."Strategies".address
    group by
      date(mainnet.estimate_block_timestamp(block)),
      token
  ),
  validator_deposit_data as (
    select
      date(greatest(mainnet.estimate_block_timestamp(mainnet."Pods".block), 
                    mainnet.epoch_timestamp(mainnet."Validators".activation_eligibility_epoch), 
                    mainnet.epoch_timestamp(mainnet."Validators".bls_epoch))) as "date",
      NULL::bytea as token,
      count(*)::double precision * 32::double precision as total_amount,
      count(*)::double precision * 32::double precision as total_shares
    from
      mainnet."Pods" inner join mainnet."Validators" on mainnet."Pods".address = mainnet."Validators".withdrawal_address
    group by
      date(greatest(mainnet.estimate_block_timestamp(mainnet."Pods".block), 
                    mainnet.epoch_timestamp(mainnet."Validators".activation_eligibility_epoch), 
                    mainnet.epoch_timestamp(mainnet."Validators".bls_epoch)))
  )
select
  date_tokens."date",
  date_tokens.token,
  coalesce(total_amount, 0::double precision) as total_amount,
  coalesce(total_shares, 0::double precision) as total_shares
from
  date_tokens
  left join (
    select * from deposit_data
    union all
    select * from validator_deposit_data
  ) deposit_data on date_tokens."date" = deposit_data."date"
  and (date_tokens.token = deposit_data.token or (date_tokens.token is null and deposit_data.token is null))
order by
  date_tokens."date",
  date_tokens.token;

create view
  mainnet."DailyWithdrawals" as
with
  min_block as (
    select min(withdraw_block) as first_block from mainnet."ShareWithdrawals" where withdraw_block is not null
  ),
  distinct_tokens as (
    select distinct token from mainnet."Strategies"
    union
    select null::bytea
  ),
  date_tokens as (
    select
      generate_series(
        mainnet.estimate_block_timestamp(min_block.first_block),
        current_date + '1 day'::interval,
        '1 day'::interval
      )::date as "date",
      distinct_tokens.token
    from
      min_block, distinct_tokens
  ),
  withdrawal_data as (
    select
      date(mainnet.estimate_block_timestamp(withdraw_block)) as "date",
      token,
      sum(amount)::double precision / (10::double precision ^ 18::double precision) as total_amount,
      sum(shares)::double precision / (10::double precision ^ 18::double precision) as total_shares
    from
      mainnet."ShareWithdrawals" inner join mainnet."Strategies" on mainnet."ShareWithdrawals".strategy = mainnet."Strategies".address
    where
      withdraw_block is not null
    group by
      date(mainnet.estimate_block_timestamp(withdraw_block)),
      token
  ),
  validator_withdrawal_data as (
    select
      date(mainnet.epoch_timestamp(exit_epoch)) as "date",
      NULL::bytea as token,
      count(*)::double precision * 32::double precision as total_amount,
      count(*)::double precision * 32::double precision as total_shares
    from
      mainnet."Validators"
    group by
      date(mainnet.epoch_timestamp(exit_epoch))
  )
select
  date_tokens."date",
  date_tokens.token,
  coalesce(total_amount, 0::double precision) as total_amount,
  coalesce(total_shares, 0::double precision) as total_shares
from
  date_tokens
  left join (
    select * from withdrawal_data
    union all
    select * from validator_withdrawal_data
  ) withdrawal_data on date_tokens."date" = withdrawal_data."date"
  and (date_tokens.token = withdrawal_data.token or (date_tokens.token is null and withdrawal_data.token is null))
order by
  date_tokens."date",
  date_tokens.token;

create view mainnet."DailyBeaconChainETHDeposits" AS
SELECT "date", total_amount, total_shares
FROM mainnet."DailyDeposits"
WHERE token IS NULL;

create view mainnet."DailyBeaconChainETHWithdrawals" AS
SELECT "date", total_amount, total_shares
FROM mainnet."DailyWithdrawals"
WHERE token IS NULL;

create view mainnet."DailyStETHDeposits" as
SELECT "date", total_amount, total_shares
FROM mainnet."DailyDeposits"
WHERE token = e'\\xae7ab96520de3a18e5e111b5eaab095312d7fe84';

create view mainnet."DailyStETHWithdrawals" as
SELECT "date", total_amount, total_shares
FROM mainnet."DailyWithdrawals"
WHERE token = e'\\xae7ab96520de3a18e5e111b5eaab095312d7fe84';

create view mainnet."DailyCbETHDeposits" as
select "date", total_amount, total_shares
from mainnet."DailyDeposits"
where token = e'\\xbe9895146f7af43049ca1c1ae358b0541ea49704';

create view mainnet."DailyCbETHWithdrawals" as
select "date", total_amount, total_shares
from mainnet."DailyWithdrawals"
where token = e'\\xbe9895146f7af43049ca1c1ae358b0541ea49704';

create view mainnet."DailyRETHDeposits" as
select "date", total_amount, total_shares
from mainnet."DailyDeposits"
where token = e'\\xae78736cd615f374d3085123a210448e74fc6393';

create view mainnet."DailyRETHWithdrawals" as
select "date", total_amount, total_shares
from mainnet."DailyWithdrawals"
where token = e'\\xae78736cd615f374d3085123a210448e74fc6393';

create view mainnet."StakersBeaconChainETHShares" as
select 
    '0x' || encode("Pods".owner, 'hex') as depositor,
    sum("Validators".effective_balance / (10::double precision ^ 9::double precision)) as total_staked_shares
from 
    mainnet."Validators"
inner join
    mainnet."Pods" on mainnet."Validators".withdrawal_address = mainnet."Pods".address
where 
    mainnet.epoch_timestamp(mainnet."Validators".exit_epoch) > current_timestamp
group by 
    "Pods".owner;

create view mainnet."StakersStETHShares" as
select 
    '0x' || encode("Deposits".depositor, 'hex') as depositor,
    (sum("Deposits".shares) - coalesce(sum("Withdrawals".shares), 0)) / (10::double precision ^ 18::double precision) as total_staked_shares
from 
    mainnet."Deposits"
left join 
    mainnet."ShareWithdrawals" as "Withdrawals" on "Deposits".depositor = "Withdrawals".depositor and "Withdrawals".withdraw_block is not null
where 
    "Deposits".strategy = e'\\x93c4b944d05dfe6df7645a86cd2206016c51564d'
group by 
    "Deposits".depositor;

create view mainnet."StakersCbETHShares" as
select 
    '0x' || encode("Deposits".depositor, 'hex') as depositor,
    (sum("Deposits".shares) - coalesce(sum("Withdrawals".shares), 0)) / (10::double precision ^ 18::double precision) as total_staked_shares
from 
    mainnet."Deposits"
left join 
    mainnet."ShareWithdrawals" as "Withdrawals" on "Deposits".depositor = "Withdrawals".depositor and "Withdrawals".withdraw_block is not null
where 
    "Deposits".strategy = e'\\x54945180db7943c0ed0fee7edab2bd24620256bc'
group by 
    "Deposits".depositor;

create view mainnet."StakersRETHShares" as
select 
    '0x' || encode("Deposits".depositor, 'hex') as depositor,
    (sum("Deposits".shares) - coalesce(sum("Withdrawals".shares), 0)) / (10::double precision ^ 18::double precision) as total_staked_shares
from 
    mainnet."Deposits"
left join 
    mainnet."ShareWithdrawals" as "Withdrawals" on "Deposits".depositor = "Withdrawals".depositor and "Withdrawals".withdraw_block is not null
where 
    "Deposits".strategy = e'\\x1bee69b7dfffa4e2d53c2a2df135c388ad25dcd2'
group by 
    "Deposits".depositor;

create view mainnet."CumulativeDailyBeaconChainETHDeposits" as
select 
    "date",
    sum(total_amount) over (order by "date") as total_amount,
    sum(total_shares) over (order by "date") as total_shares
from mainnet."DailyBeaconChainETHDeposits";

create view mainnet."CumulativeDailyBeaconChainETHWithdrawals" as
select 
    "date",
    sum(total_amount) over (order by "date") as total_amount,
    sum(total_shares) over (order by "date") as total_shares
from mainnet."DailyBeaconChainETHWithdrawals";

create view mainnet."CumulativeDailyStETHDeposits" as
select 
    "date",
    sum(total_amount) over (order by "date") as total_amount,
    sum(total_shares) over (order by "date") as total_shares
from mainnet."DailyStETHDeposits";

create view mainnet."CumulativeDailyStETHWithdrawals" as
select 
    "date",
    sum(total_amount) over (order by "date") as total_amount,
    sum(total_shares) over (order by "date") as total_shares
from mainnet."DailyStETHWithdrawals";

create view mainnet."CumulativeDailyCbETHDeposits" as
select 
    "date",
    sum(total_amount) over (order by "date") as total_amount,
    sum(total_shares) over (order by "date") as total_shares
from mainnet."DailyCbETHDeposits";

create view mainnet."CumulativeDailyCbETHWithdrawals" as
select 
    "date",
    sum(total_amount) over (order by "date") as total_amount,
    sum(total_shares) over (order by "date") as total_shares
from mainnet."DailyCbETHWithdrawals";

create view mainnet."CumulativeDailyRETHDeposits" as
select 
    "date",
    sum(total_amount) over (order by "date") as total_amount,
    sum(total_shares) over (order by "date") as total_shares
from mainnet."DailyRETHDeposits";

create view mainnet."CumulativeDailyRETHWithdrawals" as
select 
    "date",
    sum(total_amount) over (order by "date") as total_amount,
    sum(total_shares) over (order by "date") as total_shares
from mainnet."DailyRETHWithdrawals";

create view mainnet."StakedBeaconChainETH" as
select 
  sum("Validators".effective_balance / (10::double precision ^ 9::double precision)) as amount
from 
  mainnet."Validators"
inner join
  mainnet."Pods" on mainnet."Validators".withdrawal_address = mainnet."Pods".address
where 
  mainnet.epoch_timestamp(mainnet."Validators".exit_epoch) > current_timestamp;
