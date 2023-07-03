import { ethers } from "ethers";
import { SupabaseClient } from "@supabase/supabase-js";
import { addressEq, addressToPsqlHexString } from "./utils/address.ts";
import { rangeChunkMap } from "./utils/chunk.ts";
import { TransactionTrace, traceCallWalk } from "./utils/trace.ts";
import { getIndexingEndBlock, getIndexingStartBlock } from "./utils/updates.ts";
import { CHAIN_DATA, INDEXING_BLOCK_CHUNK_SIZE } from "./utils/constants.ts";
import { EigenPodManager__factory, IERC20__factory, StrategyManager__factory } from "../../typechain/index.ts";
import { TypedContractEvent, TypedEventLog } from "../../typechain/common.ts";
import { DepositEvent, StrategyManager } from "../../typechain/StrategyManager.ts";
import { TransferEvent } from "../../typechain/IERC20.ts";


// serialization polyfill
import "./utils/bigint.ts";
import { Database } from "../database.types.ts";

interface Deposit {
  depositor: string;
  amount: bigint;
  block: number;
  log_index: number;
  strategy: string;
  shares: bigint;
  caller: string;
}

type DepositLog = TypedEventLog<
  TypedContractEvent<
    DepositEvent.InputTuple,
    DepositEvent.OutputTuple,
    DepositEvent.OutputObject
  >
>;

type TransferLog = TypedEventLog<
  TypedContractEvent<
    TransferEvent.InputTuple,
    TransferEvent.OutputTuple,
    TransferEvent.OutputObject
  >
>;

/**
 * Gets the Deposit logs in a block range from a StrategyManager contract.
 * @param strategyManager StrategyManager contract.
 * @param fromBlock Starting block.
 * @param toBlock End block.
 * @returns Deposit logs.
 */
async function getDepositLogs(strategyManager: StrategyManager, fromBlock: number, toBlock: number): Promise<DepositLog[]> {
  return await strategyManager.queryFilter(strategyManager.getEvent("Deposit"), fromBlock, toBlock);
}

/**
 * Gets ERC20 Transfer logs related to Deposit StrategyManager logs in a block
 * range. This is used later on to try and get the actual amount staked.
 * @param provider Network provider.
 * @param depositLogs Deposit logs.
 * @param fromBlock Starting block.
 * @param toBlock End block.
 * @returns Transfer logs.
 */
async function getTransferLogsFromDeposits(
  provider: ethers.Provider,
  depositLogs: DepositLog[],
  fromBlock: number,
  toBlock: number
): Promise<TransferLog[]> {
  if (!depositLogs.length) return [];

  const ierc20 = IERC20__factory.createInterface();

  return (
    await provider.getLogs({
      address: Array.from(new Set(depositLogs.map(el => el.args.token))),
      topics: [
        // Transfer
        ierc20.getEvent("Transfer").topicHash,
        // from
        null,
        // to
        Array.from(new Set(depositLogs.map(el => ethers.zeroPadValue(el.args.strategy, 32)))),
      ],
      fromBlock,
      toBlock,
    })
  ).map(log => {
    return new ethers.EventLog(
      log,
      ierc20,
      ierc20.getEvent("Transfer")
    ) as unknown as TransferLog;
  });
}

/**
 * Gets Deposit and Transfer events of transactions in a block range.
 * @param provider Network provider.
 * @param strategyManager StrategyManager contract.
 * @param fromBlock Starting block.
 * @param toBlock End block.
 * @returns Map from transaction hash to an object containing the logs.
 */
async function getTransactionDepositsAndTransfers(
  provider: ethers.Provider,
  strategyManager: StrategyManager,
  fromBlock: number,
  toBlock: number
): Promise<Map<string, { deposits: DepositLog[], transfers: TransferLog[] }>> {
  const txLogs = new Map<string, { deposits: DepositLog[], transfers: TransferLog[] }>();

  const depositLogs = await getDepositLogs(strategyManager, fromBlock, toBlock);
  const transferLogs = await getTransferLogsFromDeposits(provider, depositLogs, fromBlock, toBlock);

  depositLogs.forEach(log => {
    if (!txLogs.get(log.transactionHash)) {
      txLogs.set(log.transactionHash, { deposits: [], transfers: [] });
    }
    txLogs.get(log.transactionHash)!.deposits.push(log);
  });
  transferLogs.forEach(log => {
    if (txLogs.get(log.transactionHash)) {
      txLogs.get(log.transactionHash)!.transfers.push(log);
    }
  });

  return txLogs;
}

/**
 * Checks, from the Deposit and Transfer events of a transaction, if it's just
 * a "straightforward" deposit, i.e. a direct deposit call. This is done
 * safely, basically this is only true if there's only one Deposit, one
 * Transfer and they're both related.
 * @param deposits Deposit logs.
 * @param transfers Transfer logs.
 * @returns Whether this is a "straigtforward" deposit or not.
 */
function isStraightforwardDeposit(
  deposits: DepositLog[],
  transfers: TransferLog[]
): boolean {
  return deposits.length === 1
    && transfers.length == 1
    && addressEq(deposits[0].args.strategy, transfers[0].args.to)
    && addressEq(deposits[0].args.token, transfers[0].address);
}

/**
 * Gets indexable deposit data from a block range. In steps, for each block
 * range chunk:
 * * Get Deposit and Transfer logs from transactions.
 *  - If the transaction contains just a normal deposit, process it right away
 *  - Otherwise, get transaction traces and decode individual
 *    "depositIntoStrategy*" calls to then process the data.
 * * Get BeaconChainETHDeposited logs and process deposits, fetching the
 *   EigenPod owners and considering them as the deposit callers.
 * @param provider Network provider.
 * @param startBlock Starting block.
 * @param endBlock End block.
 * @param chunkSize Maximum block range for log filtering calls.
 * @returns Indexable deposit data for a block range.
 */
async function indexDepositsRange(
  provider: ethers.JsonRpcApiProvider,
  startBlock: number,
  endBlock: number,
  chunkSize: number,
  chain: "mainnet" | "goerli",
): Promise<Deposit[]> {
  const index: Deposit[] = [];

  const strategyManager = StrategyManager__factory.connect(CHAIN_DATA[chain].strategyManagerAddress, provider);
  const eigenPodManager = EigenPodManager__factory.connect(CHAIN_DATA[chain].eigenPodManagerAddress, provider);

  const beaconChainStrategy = await strategyManager.beaconChainETHStrategy();

  await Promise.all(
    rangeChunkMap(startBlock, endBlock, chunkSize, async (fromBlock, toBlock) => {
      const txLogs = await getTransactionDepositsAndTransfers(
        provider,
        strategyManager,
        fromBlock,
        toBlock
      );
      const traceRequests: { block: number, deposits: DepositLog[], request: Promise<TransactionTrace> }[] = [];

      txLogs.forEach(({ deposits, transfers }, txHash) => {
        if (isStraightforwardDeposit(deposits, transfers)) {
          // being straightforward also means only 1 deposit
          const deposit = deposits[0];
          const transfer = transfers[0];

          index.push({
            block: deposit.blockNumber,
            log_index: deposit.index,
            depositor: addressToPsqlHexString(deposit.args.depositor),
            amount: transfer.args.value,
            strategy: addressToPsqlHexString(deposit.args.strategy),
            shares: deposit.args.shares,
            caller: addressToPsqlHexString(transfer.args.from),
          });
        }
        else {
          traceRequests.push({
            block: deposits[0].blockNumber,
            deposits,
            request: provider.send("debug_traceTransaction", [txHash, { type: "callTracer" }])
          });
        }
      });

      const depositFragments = [
        "depositIntoStrategy",
        "depositIntoStrategyWithSignature"
      ].map(el => strategyManager.getFunction(el).fragment);

      await Promise.all(
        traceRequests.map(traceRequest => traceRequest.request.then(txTrace => {
          traceCallWalk(txTrace.result, true, trace => {
            const fragment = depositFragments.find(el => el.selector === trace.input.slice(0, 10));
            const depositMatches = traceRequest.deposits.map(deposit => ({ matched: false, deposit }));

            if (addressEq(trace.to, CHAIN_DATA[chain].strategyManagerAddress) && fragment) {
              const decodedInput = strategyManager.interface.decodeFunctionData(fragment, trace.input);
              const depositor = decodedInput.staker || trace.from;
              const shares = strategyManager.interface.parseCallResult(trace.output)[0];

              const matchingDeposit = depositMatches.find(depositMatch => {
                if (depositMatch.matched) return false;

                if (
                  addressEq(depositMatch.deposit.args.strategy, decodedInput.strategy)
                  && addressEq(depositMatch.deposit.args.depositor, depositor)
                  && depositMatch.deposit.args.shares === shares
                ) {
                  depositMatch.matched = true;
                  return true;
                }

                return false;
              });

              if (!matchingDeposit) throw new Error(`Couldn't find deposit trace in block ${traceRequest.block}`);

              index.push({
                block: traceRequest.block,
                log_index: matchingDeposit.deposit.index,
                depositor: addressToPsqlHexString(depositor),
                amount: decodedInput.amount,
                strategy: addressToPsqlHexString(decodedInput.strategy),
                shares,
                caller: addressToPsqlHexString(trace.from),
              });
            }
          });
        }))
      );

      const beaconChainDepositLogs = await eigenPodManager.queryFilter(
        eigenPodManager.getEvent("BeaconChainETHDeposited"),
        fromBlock,
        toBlock
      );

      const ownerToPod: Record<string, Promise<string>> = {};
      (new Set(beaconChainDepositLogs.map(el => el.args.podOwner))).forEach(owner => {
        if (!ownerToPod[owner]) ownerToPod[owner] = eigenPodManager.ownerToPod(owner);
      });

      await Promise.all(beaconChainDepositLogs.map(async log => {
        index.push({
          block: log.blockNumber,
          log_index: log.index,
          depositor: addressToPsqlHexString(log.args.podOwner),
          amount: log.args.amount,
          strategy: addressToPsqlHexString(beaconChainStrategy),
          shares: log.args.amount,
          caller: addressToPsqlHexString(await ownerToPod[log.args.podOwner]),
        });
      }));
    })
  );

  return index;
}

/**
 * Does the default indexing procedure, getting the start block through the DB
 * and setting the end block to the default indexing end block (at the moment
 * the current finalized block), then fetches the indexable deposit data and
 * feeds it to the Deposit table in the Supabase DB, while also updating the
 * last indexed block record.
 * @param supabase Supabase client.
 * @param provider Network provider.
 */
export async function indexDeposits(
  supabase: SupabaseClient<Database>,
  provider: ethers.JsonRpcApiProvider,
  chain: "mainnet" | "goerli",
): Promise<{ startBlock: number; endBlock: number }> {
  const startBlock = await getIndexingStartBlock(supabase, "Deposits", chain);
  const endBlock = await getIndexingEndBlock(startBlock, provider);

  const results = await indexDepositsRange(provider, startBlock, endBlock, INDEXING_BLOCK_CHUNK_SIZE, chain);
  const { error } = await supabase.rpc("index_deposits", { p_rows: results, p_block: endBlock });

  if (error) throw error;

  return { startBlock, endBlock };
}
