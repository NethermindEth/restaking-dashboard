create or replace function mainnet.estimate_block_timestamp(block_number integer)
returns timestamp as $$
declare
    ref_block_number integer := 17000000;
    ref_block_timestamp timestamp := '2023-04-07 23:58:11';
    avg_block_time float := 12.1894276;
    result timestamp;
begin
    result := ref_block_timestamp + (((block_number - ref_block_number) * avg_block_time)::integer) * interval '1 second';
    return result;
end;
$$ language plpgsql;

create or replace function mainnet.epoch_timestamp(epoch_number numeric)
returns timestamp as $$
declare
    first_epoch_timestamp timestamp := '2020-12-01 12:00:23';
    epoch_duration_seconds integer := 32 * 12;
begin
    if epoch_number = 18446744073709552000 then
        return 'infinity';
    else
        return first_epoch_timestamp + epoch_number * epoch_duration_seconds * interval '1 second';
    end if;
end;
$$ language plpgsql;
