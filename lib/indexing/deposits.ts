import { ethers } from "ethers";
import { provider } from "../provider";
import { supabase } from "../supabaseClient";
import { chunkMap } from "./utils/chunk";
import { addressEq } from "./utils/address";
import { TransactionTrace, traceCallWalk } from "./utils/trace";
import { EIGEN_POD_ADDRESS, INDEXING_START_BLOCK, STRATEGY_MANAGER_ADDRESS } from "./utils/constants";
import { EigenPodManager__factory, IERC20__factory, StrategyManager__factory } from "../../typechain";
import { TypedContractEvent, TypedEventLog } from "../../typechain/common";
import { DepositEvent, StrategyManager } from "../../typechain/StrategyManager";
import { TransferEvent } from "../../typechain/IERC20";

// serialization polyfill
import "./utils/bigint";

interface Deposit {
  block: number;
  depositor: string;
  token: string;
  amount: bigint;
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

async function getDepositLogs(strategyManager: StrategyManager, fromBlock: number, toBlock: number): Promise<DepositLog[]> {
  return await strategyManager.queryFilter(strategyManager.getEvent("Deposit"), fromBlock, toBlock);
}

async function getTransferLogsFromDeposits(depositLogs: DepositLog[], fromBlock: number, toBlock: number): Promise<TransferLog[]> {
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

async function getTransactionDepositsAndTransfers(
  strategyManager: StrategyManager,
  fromBlock: number,
  toBlock: number
): Promise<Map<string, { deposits: DepositLog[], transfers: TransferLog[] }>> {
  const txLogs = new Map<string, { deposits: DepositLog[], transfers: TransferLog[] }>();

  const depositLogs = await getDepositLogs(strategyManager, fromBlock, toBlock);
  const transferLogs = await getTransferLogsFromDeposits(depositLogs, fromBlock, toBlock);

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

function isStraightforwardDeposit(
  deposits: DepositLog[],
  transfers: TransferLog[]
): boolean {
  return deposits.length === 1
    && transfers.length == 1
    && addressEq(deposits[0].args.strategy, transfers[0].args.to)
    && addressEq(deposits[0].args.token, transfers[0].address);
}

async function indexDepositsRange(
  startingBlock: number,
  currentBlock: number,
  chunkSize: number
): Promise<Deposit[]> {
  const index: Deposit[] = [];

  const strategyManager = StrategyManager__factory.connect(STRATEGY_MANAGER_ADDRESS, provider);
  const eigenPodManager = EigenPodManager__factory.connect(EIGEN_POD_ADDRESS, provider);

  const beaconChainStrategy = await strategyManager.beaconChainETHStrategy();

  await Promise.all(
    chunkMap(startingBlock, currentBlock, chunkSize, async (fromBlock, toBlock) => {
      const txLogs = await getTransactionDepositsAndTransfers(strategyManager, fromBlock, toBlock);
      const traceRequests: { block: number, request: Promise<TransactionTrace> }[] = [];

      txLogs.forEach(({ deposits, transfers }, txHash) => {
        if (isStraightforwardDeposit(deposits, transfers)) {
          const deposit = deposits[0];
          const transfer = transfers[0];

          index.push({
            block: deposit.blockNumber,
            depositor: deposit.args.depositor,
            token: deposit.args.token,
            amount: transfer.args.value,
            strategy: deposit.args.strategy,
            shares: deposit.args.shares,
            caller: transfer.args.from,
          });
        }
        else {
          traceRequests.push({
            block: deposits[0].blockNumber,
            request: provider.send("debug_traceTransaction", [txHash, { type: "callTracer" }])
          });
        }
      });

      const depositFragments = [
        "depositIntoStrategy",
        "depositIntoStrategyWithSignature"
      ].map(el => strategyManager.getFunction(el).fragment);

      await Promise.all(traceRequests.map((traceRequest, idx) => traceRequest.request.then((txTrace) => {
        traceCallWalk(txTrace.result, true, trace => {
          const fragment = depositFragments.find(el => el.selector === trace.input.slice(0, 10));

          if (addressEq(trace.to, STRATEGY_MANAGER_ADDRESS) && fragment) {
            const decodedInput = strategyManager.interface.decodeFunctionData(fragment, trace.input);

            index.push({
              block: traceRequest.block,
              depositor: decodedInput.staker || trace.from,
              token: decodedInput.token,
              amount: decodedInput.amount,
              strategy: decodedInput.strategy,
              shares: strategyManager.interface.parseCallResult(trace.output)[0],
              caller: trace.from,
            });
          }
        })
      })));

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
          depositor: log.args.podOwner,
          token: ethers.ZeroAddress,
          amount: log.args.amount,
          strategy: beaconChainStrategy,
          shares: log.args.amount,
          caller: await ownerToPod[log.args.podOwner],
        });
      }));
    })
  );

  return index;
}

export async function indexDeposits() {
  const lastRow = await supabase
    .from("_Deposits")
    .select("block")
    .order("block", { ascending: false })
    .limit(1);
  const startingBlock = (lastRow.data !== null && lastRow.data.length !== 0)
    ? lastRow.data[0].block + 1
    : INDEXING_START_BLOCK;
  const currentBlock = await provider.getBlockNumber();

  const results = await indexDepositsRange(startingBlock, currentBlock, 2_000);

  await supabase.from("_Deposits").insert(results);
}
