import { Inter } from "next/font/google";
import LineChart from "../charts/LineChart";
import PieChart from "../charts/PieChart";
import StackedBar from "../charts/StackedBar";

const inter = Inter({ subsets: ["latin"] });

import { supabase } from "../lib/supabaseClient";
import {
  BlockData,
  accumulateAmounts,
  extractAmountsAndTimestamps,
  extractAmountsAndTimestampsWithPrevious,
  mergeBlockChunks,
  roundToDecimalPlaces,
  sumTotalAmounts,
} from "@/lib/utils";

export default async function Home() {
  // const { deposits } = await getDeposits();
  // const latestDeposits = await getLastDeposits();
  const {
    rEthDeposits,
    totalrEthDeposits,
    cummulativerEthDeposits,
    stEthDeposits,
    totalstEthDeposits,
    cummulativestEthDeposits,
    chartDataDepositsDaily,
    chartDataDepositsCumulative,
    chartDataWithdrawalsDaily,
    chartDataWithdrawalsCumulative,
  } = await getDeposits();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          EigenLayer / Nethermind
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <p>Logo / Credits</p>
        </div>
      </div>
      <div className="my-8 flex">
        <div className="p-6 mx-4 shadow-md rounded-md">
          <div>
            <div className="">Once staked rETH</div>
            <div className="">{roundToDecimalPlaces(totalrEthDeposits)}</div>
          </div>
        </div>
        <div className="p-6 mx-4 shadow-md rounded-md">
          <div>
            <div className="">Once staked stEth</div>
            <div className="">{roundToDecimalPlaces(totalstEthDeposits)}</div>
          </div>
        </div>
      </div>
      {/* <div className="p-6 mx-4 shadow-md rounded-md">
          <div>
            <div className="">Total Staked ETH</div>
            <div className="">{latestDeposits.amountNative}</div>
          </div>
        </div>
        <div className="p-6 mx-4 shadow-md rounded-md">
          <div>
            <div className="">Total Staked StEth</div>
            <div className="">{latestDeposits.amountStEth}</div>
          </div>
        </div>
        <div className="p-6 mx-4 shadow-md rounded-md">
          <div>
            <div className="">Total Staked rEth</div>
            <div className="">{latestDeposits.amountREth}</div>
          </div>
        </div> */}

      <div className="staking-dashboard w-full">
        <div className="charts-homepage">
          <h3>Staked LSTs by date</h3>

          <div className="chart-staked-lst-date">
            <StackedBar
              data={{
                amounts: chartDataDepositsDaily.amounts,
                labels: chartDataDepositsDaily.timestamps,
              }}
              title="Staked LSTs by date"
            />
          </div>
        </div>
        <div className="charts-homepage mt-6">
          <h3>Cummulative staked LSTs</h3>
          <div className="chart-2">
            <LineChart
              data={{
                title: "Cummulative staked LSTs",
                amounts: chartDataDepositsCumulative.amounts,
                timestamps: chartDataDepositsCumulative.timestamps,
              }}
            />
          </div>
        </div>
        <div className="charts-homepage mt-6">
          <h3>Withdrawn LSTs by date</h3>

          <div className="chart-staked-lst-date">
            <StackedBar
              data={{
                amounts: chartDataWithdrawalsDaily.amounts,
                labels: chartDataWithdrawalsDaily.timestamps,
              }}
              title="Withdrawn LSTs by date"
            />
          </div>
        </div>
        <div className="charts-homepage mt-6">
          <h3>Cummulative withdrawn LSTs</h3>
          <div className="chart-2">
            <LineChart
              data={{
                title: "Cummulative withdrawn LSTs",
                amounts: chartDataWithdrawalsCumulative.amounts,
                timestamps: chartDataWithdrawalsCumulative.timestamps,
              }}
            />
          </div>
        </div>
        {/* <div className="charts-homepage pie-chart-deposits w-1/2 mx-auto">
          <h3>PieChart of restaked tokens</h3>
          <PieChart
            data={{
              amounts: [
                latestDeposits.amountNative,
                latestDeposits.amountStEth,
                latestDeposits.amountREth,
              ],
              labels: ["restaked ETH", "restaked StEth", "restaked REth"],
            }}
          />
        </div> */}
      </div>
    </main>
  );
}

async function getDeposits() {
  // Move to promise.all

  // Deposits
  let { data: rEthDeposits, error: rEthDepositError } = await supabase
    .from("consumabledailydepositsreth")
    .select("*");
  rEthDeposits = mergeBlockChunks(rEthDeposits as BlockData[]);
  let totalrEthDeposits = sumTotalAmounts(rEthDeposits as BlockData[]);
  let cummulativerEthDeposits = accumulateAmounts(rEthDeposits as BlockData[]);

  let { data: stEthDeposits, error: stEthDepositError } = await supabase
    .from("consumabledailydepositssteth")
    .select("*");
  stEthDeposits = mergeBlockChunks(stEthDeposits as BlockData[]);
  let totalstEthDeposits = sumTotalAmounts(stEthDeposits as BlockData[]);
  let cummulativestEthDeposits = accumulateAmounts(
    stEthDeposits as BlockData[]
  );

  // Deposits prepared for charts.
  let chartDataDepositsDaily = extractAmountsAndTimestamps(
    stEthDeposits as BlockData[],
    rEthDeposits as BlockData[]
  );

  let chartDataDepositsCumulative = extractAmountsAndTimestampsWithPrevious(
    cummulativestEthDeposits,
    cummulativerEthDeposits
  );

  // Withdrawals
  let { data: rEthWithdrawals, error: rEthWithDrawalsError } = await supabase
    .from("consumabledailywithdrawalsreth")
    .select("*");
  rEthWithdrawals = mergeBlockChunks(rEthWithdrawals as BlockData[]);
  let totalrEthWithdrawals = sumTotalAmounts(rEthWithdrawals as BlockData[]);
  let cummulativerEthWithdrawals = accumulateAmounts(
    rEthWithdrawals as BlockData[]
  );

  let { data: stEthWithdrawals, error: stEthWithDrawalsError } = await supabase
    .from("consumabledailywithdrawalssteth")
    .select("*");
  stEthWithdrawals = mergeBlockChunks(stEthWithdrawals as BlockData[]);
  let totalstEthWithdrawals = sumTotalAmounts(stEthWithdrawals as BlockData[]);
  let cummulativestEthWithdrawals = accumulateAmounts(
    stEthWithdrawals as BlockData[]
  );

  // Withdrawals prepared for charts.
  let chartDataWithdrawalsDaily = extractAmountsAndTimestamps(
    stEthWithdrawals as BlockData[],
    rEthWithdrawals as BlockData[]
  );

  let chartDataWithdrawalsCumulative = extractAmountsAndTimestampsWithPrevious(
    cummulativestEthWithdrawals,
    cummulativerEthWithdrawals
  );

  return {
    rEthDeposits,
    totalrEthDeposits,
    cummulativerEthDeposits,
    stEthDeposits,
    totalstEthDeposits,
    cummulativestEthDeposits,
    chartDataDepositsDaily,
    chartDataDepositsCumulative,
    chartDataWithdrawalsDaily,
    chartDataWithdrawalsCumulative,
  };
}
// async function getLastDeposits() {
//   let { data } = await supabase
//     .from("Deposits")
//     .select("*")
//     .order("created_at", { ascending: false })
//     .limit(1);

//   // console.log(data);
//   return data ? data[0] : {};
// }
