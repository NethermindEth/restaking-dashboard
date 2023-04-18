import { IERC20__factory, StrategyManager__factory } from "@/typechain";
import { provider } from "../provider";
import { chunkMap } from "./utils/chunk";
import { supabase } from "../supabaseClient";
import { ethers } from "ethers";
import { addressEq } from "./utils/address";
import { TransactionTrace, traceCallWalk } from "./utils/trace";
import { STRATEGY_MANAGER_ADDRESS } from "./utils/constants";

interface Deposit {
  block: number;
  depositor: string;
  token: string;
  amount: bigint;
  strategy: string;
  shares: bigint;
  caller: string;
}

export async function indexDeposits() {
  const index: Deposit[] = [];

  const strategyManager = StrategyManager__factory.connect(STRATEGY_MANAGER_ADDRESS, provider);
  const ierc20 = IERC20__factory.createInterface();

  const lastRow = await supabase
    .from("_Deposits")
    .select("block")
    .order("block", { ascending: false })
    .limit(1);
  const startingBlock = (lastRow.data !== null)? lastRow.data[0].block : 0;
  const currentBlock = await provider.getBlockNumber();

  await Promise.all(
    chunkMap(startingBlock, currentBlock, 10_000, async (fromBlock, toBlock) => {
      const depositLogs = await strategyManager.queryFilter(strategyManager.getEvent("Deposit"), fromBlock, toBlock);

      if (!depositLogs.length) return;

      const transferLogs = (await provider.getLogs({
        address: Array.from(new Set(depositLogs.map(el => el.args.token))),
        topics: [
          // Transfer
          ierc20.getEvent("Transfer").topicHash,
          // from
          null,
          // to
          Array.from(new Set(depositLogs.map(el => el.args.strategy))),
        ],
        fromBlock,
        toBlock,
      })).map(log => new ethers.EventLog(log, ierc20, ierc20.getEvent("Transfer")));

      const txLogs = new Map<string, { deposits: typeof depositLogs, transfers: typeof transferLogs }>();
      depositLogs.forEach(log => {
        if (!txLogs.get(log.transactionHash)) {
          txLogs.set(log.transactionHash, { deposits: [], transfers: [] });
        }
        else {
          txLogs.get(log.transactionHash)!.deposits.push(log);
        }
      });
      transferLogs.forEach(log => {
        if (txLogs.get(log.transactionHash)) {
          txLogs.get(log.transactionHash)!.transfers.push(log);
        }
      });

      const txTraces: Promise<TransactionTrace>[] = [];
      const blocks: number[] = [];

      txLogs.forEach(({ deposits, transfers }, txHash) => {
        if (
          deposits.length === 1
          && transfers.length == 1
          && addressEq(deposits[0].args.strategy, transfers[0].args.to)
          && addressEq(deposits[0].args.token, transfers[0].address)
        ) {
          index.push({
            block: deposits[0].blockNumber,
            depositor: deposits[0].args.depositor,
            token: deposits[0].args.token,
            amount: transfers[0].args.amount,
            strategy: deposits[0].args.strategy,
            shares: deposits[0].args.shares,
            caller: transfers[0].args.from,
          });
        }
        else {
          txTraces.push(provider.send("debug_traceTransaction", [txHash, { type: "callTracer" }]));
          blocks.push(deposits[0].blockNumber);
        }
      });

    })
  );
}
