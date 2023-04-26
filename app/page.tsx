import { ethers } from "ethers";
import { Inter } from "next/font/google";
import LineChart from "./components/charts/LineChart";
import PieChart from "./components/charts/PieChart";
import StackedBar from "./components/charts/StackedBar";
import LeaderBoard from "./components/leaderboard";

const inter = Inter({ subsets: ["latin"] });

import { supabase } from "../lib/supabaseClient";
import {
  BlockData,
  UserData,
  accumulateAmounts,
  extractAmountsAndTimestamps,
  extractAmountsAndTimestampsWithPrevious,
  getENSNameIfExist,
  mergeBlockChunks,
  roundToDecimalPlaces,
  subtractArrays,
  sumTotalAmounts,
} from "@/lib/utils";
import { RocketTokenRETH__factory } from "@/typechain";
import Image from "next/image";

const RETH_ADDRESS = "0x178E141a0E3b34152f73Ff610437A7bf9B83267A";
const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli");

export default async function Home() {
  const {
    rEthDeposits,
    totalrEthDeposits,
    cummulativerEthDeposits,
    stEthDeposits,
    totalstEthDeposits,
    cummulativestEthDeposits,
    chartDataDepositsDaily,
    chartDataDepositsCumulative,
    stEthWithdrawals,
    totalstEthWithdrawals,
    totalrEthWithdrawals,
    cummulativestEthWithdrawals,
    chartDataWithdrawalsDaily,
    chartDataWithdrawalsCumulative,
    chartDataSumStEth,
    chartDataSumREth,
    beaconChainStakes,
    totalBeaconChainStakes,
    cummulativeBeaconChainStakes,
    stakersBeaconChainConverted,
    stakersRethConverted,
    stakersStethConverted,
    groupedStakers,
    rEthRate,
  } = await getDeposits();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 md:p-24 font-semibold">
      <div className="z-10 max-w-5xl items-center justify-between font-mono text-sm">
        <div className="h-48 flex w-full items-center justify-center lg:static lg:h-auto lg:w-auto lg:bg-none lgmb-12">
          <Image
            src={"/logo.png"}
            alt="EigenLayer Logo"
            width={64}
            height={72}
          />
          <p className="text-lg md:text-2xl ml-4">
            EigenLayer Stats on Testnet
          </p>
        </div>
      </div>

      <div className="my-8 w-full lg:w-1/2 flex flex-wrap flex-col lg:flex-row lg:flex-nowrap items-stretch justify-center">
        <div className="data-card data-card-steth grow mt-8 lg:mt-0 py-8 px-10 md:px-24 mx-4 shadow-lg rounded-md text-center">
          <span className="inline-block">
            <Image
              src={"/steth_logo.webp"}
              alt="stETH"
              width={48}
              height={48}
            />
          </span>
          <p className="text-sm md:text-base">Staked stETH</p>
          <p className="md:text-xl">
            {roundToDecimalPlaces(totalstEthDeposits - totalstEthWithdrawals)}
          </p>
        </div>
        <div className="data-card data-card-reth grow mt-8 lg:mt-0 py-8 px-10 md:px-24 mx-4 shadow-lg rounded-md text-center">
          <span className="inline-block ">
            <Image src={"/reth.webp"} alt="rETH" width={48} height={48} />
          </span>
          <p className="text-sm md:text-base">Staked rETH</p>
          <p className="md:text-xl">
            {roundToDecimalPlaces(totalrEthDeposits - totalrEthWithdrawals)}
          </p>
        </div>
        <div className="data-card data-card-eth grow mt-8 lg:mt-0 py-8 px-10 md:px-24 mx-4 shadow-lg rounded-md text-center">
          <span className="inline-block">
            <Image
              src={"/beaconChainETH.png"}
              alt="ETH"
              width={48}
              height={48}
            />
          </span>
          <p className="text-sm md:text-base">Beacon Chain ETH</p>
          <p className="md:text-xl">
            {roundToDecimalPlaces(totalBeaconChainStakes)}
          </p>
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

      <div className="staking-dashboard w-full md:w-3/4 lg:w-2/3 2xl:w-1/2">
        <div className="charts-homepage mt-16">
          <h3 className="text-center text-xl">
            Cumulative deposited tokens by day
          </h3>
          <div className="chart-2">
            <LineChart
              data={{
                title: "Cumulative deposited tokens by day",
                amounts: chartDataDepositsCumulative.amounts,
                timestamps: chartDataDepositsCumulative.timestamps,
                namedLabels: ["stETH", "rETH", "Beacon Chain ETH"],
              }}
            />
          </div>
        </div>
        <div className="charts-homepage mt-16">
          <h3 className="text-center text-xl">Deposited tokens by day</h3>
          <div className="chart-staked-lst-date">
            <StackedBar
              data={{
                amounts: chartDataDepositsDaily.amounts,
                labels: chartDataDepositsDaily.timestamps,
                namedLabels: ["stETH", "rETH", "Beacon Chain ETH"],
              }}
              title="Staked tokens by day"
            />
          </div>
        </div>

        <div className="charts-homepage mt-16">
          <h3 className="text-center text-xl">
            Cumulative Token Withdrawals by day
          </h3>
          <div className="chart-2">
            <LineChart
              data={{
                title: "Cumulative Token Withdrawals by day",
                amounts: chartDataWithdrawalsCumulative.amounts,
                timestamps: chartDataWithdrawalsCumulative.timestamps,
                namedLabels: ["stETH", "rETH"],
              }}
            />
          </div>
        </div>

        <div className="charts-homepage mt-16">
          <h3 className="text-center text-xl">Token Withdrawals by day</h3>
          <div className="chart-staked-lst-date">
            <StackedBar
              data={{
                amounts: chartDataWithdrawalsDaily.amounts,
                labels: chartDataWithdrawalsDaily.timestamps,
                namedLabels: ["stETH", "rETH"],
              }}
              title="Token Withdrawals by day"
            />
          </div>
        </div>

        {/* <div className="charts-homepage mt-6">
          <h3>Staking and withdrawing of StEth</h3>
          <div className="chart-staked-lst-date">
            <StackedBar
              data={{
                amounts: chartDataSumStEth.amounts,
                labels: chartDataSumStEth.timestamps,
                namedLabels: ["Staked - Withdrawn"],
              }}
              title="Staking and withdrawing of StEth"
            />
          </div>
        </div>
        <div className="charts-homepage mt-6">
          <h3>Staking and withdrawing of rEth</h3>
          <div className="chart-2">
            <LineChart
              data={{
                title: "Staking and withdrawing of rEth",
                amounts: chartDataSumREth.amounts,
                timestamps: chartDataSumREth.timestamps,
                namedLabels: ["Staked - Withdrawn"],
              }}
            />
          </div>
        </div> */}

        <div className="charts-homepage pie-chart-deposits w-full md:w-1/3 mx-auto mt-16">
          <h3 className="text-center text-xl">Deposited tokens</h3>
          <PieChart
            data={{
              amounts: [
                totalstEthDeposits - totalstEthWithdrawals,
                (totalrEthDeposits - totalrEthWithdrawals) * rEthRate,
                totalBeaconChainStakes,
              ],
              labels: ["stETH", "rETH (as ETH)", "Beacon Chain ETH"],
            }}
          />
        </div>

        <LeaderBoard
          boardData={{
            ethStakers: groupedStakers,
            stethStakers: stakersStethConverted,
            rethStakers: stakersRethConverted,
            beaconchainethStakers: stakersBeaconChainConverted,
          }}
          title="Restaking Leaderboard"
        />
      </div>
      <div className="mt-32">
        <p className="flex items-center">
          <span className="pr-2">Made with ❤️ at Nethermind </span>
          <Image
            src={"/nethermind.png"}
            width={32}
            height={32}
            alt={"Nethermind logo"}
            style={{ display: "inline-block" }}
          />
        </p>
      </div>
    </main>
  );
}

async function getDeposits() {
  const rEth = RocketTokenRETH__factory.connect(RETH_ADDRESS, provider);
  const rEthRate = Number(await rEth.getExchangeRate()) / 1e18;

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

  let { data: beaconChainStakes } = await supabase
    .from("consumablebeaconchainstakeseth")
    .select("*");
  beaconChainStakes = mergeBlockChunks(beaconChainStakes as BlockData[]);
  let totalBeaconChainStakes = sumTotalAmounts(
    beaconChainStakes as BlockData[]
  );
  let cummulativeBeaconChainStakes = accumulateAmounts(
    beaconChainStakes as BlockData[]
  );

  // Deposits prepared for charts.
  let chartDataDepositsDaily = extractAmountsAndTimestamps(
    stEthDeposits as BlockData[],
    rEthDeposits as BlockData[],
    beaconChainStakes as BlockData[]
  );

  let chartDataDepositsCumulative = extractAmountsAndTimestampsWithPrevious(
    cummulativestEthDeposits,
    cummulativerEthDeposits,
    cummulativeBeaconChainStakes
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

  let sumStEth = subtractArrays(
    stEthDeposits as BlockData[],
    stEthWithdrawals as BlockData[]
  );

  let sumREth = subtractArrays(
    rEthDeposits as BlockData[],
    rEthWithdrawals as BlockData[]
  );

  let chartDataSumStEth = extractAmountsAndTimestamps(
    subtractArrays(sumStEth, sumREth)
  );

  // let chartDataStEthCumulative = extractAmountsAndTimestampsWithPrevious(
  //   cummulativestEthDeposits,
  //   cummulativerEthDeposits
  // );

  let chartDataSumREth = extractAmountsAndTimestamps(
    subtractArrays(sumREth, sumStEth)
  );

  // let chartDataREthCumulative = extractAmountsAndTimestampsWithPrevious(
  //   cummulativerEthDeposits,
  //   cummulativestEthDeposits
  // );

  // LeaderBoard
  let { data: stakersBeaconChainEth } = await supabase
    .from("stakers_beaconchaineth_deposits_view")
    .select("*");
  let { data: stakersReth } = await supabase
    .from("stakers_reth_deposits_view")
    .select("*");
  let { data: stakersSteth } = await supabase
    .from("stakers_steth_deposits_view")
    .select("*");

  const stakersRethConverted = await Promise.all(
    (stakersReth as UserData[]).map(async (d) => ({
      depositor: await getENSNameIfExist(d.depositor, provider),
      total_deposits: d.total_deposits,
    }))
  );
  const stakersStethConverted = await Promise.all(
    (stakersSteth as UserData[]).map(async (d) => ({
      depositor: await getENSNameIfExist(d.depositor, provider),
      total_deposits: d.total_deposits * rEthRate,
    }))
  );
  const stakersBeaconChainConverted = await Promise.all(
    (stakersBeaconChainEth as UserData[]).map(async (d) => ({
      depositor: await getENSNameIfExist(d.depositor, provider),
      total_deposits: d.total_deposits,
    }))
  );
  const groupedStakers = [
    ...(stakersBeaconChainConverted as UserData[]),
    ...(stakersRethConverted as UserData[]),
    ...(stakersStethConverted as UserData[]),
  ]
    .reduce((acc, cur) => {
      const existingDepositor = acc.find(
        (d: UserData) => d.depositor === cur.depositor
      );
      existingDepositor
        ? (existingDepositor.total_deposits += cur.total_deposits)
        : acc.push(cur);
      return acc;
    }, [] as UserData[])
    .sort((a, b) => b.total_deposits - a.total_deposits);

  return {
    rEthDeposits,
    totalrEthDeposits,
    cummulativerEthDeposits,
    stEthDeposits,
    totalstEthDeposits,
    cummulativestEthDeposits,
    chartDataDepositsDaily,
    chartDataDepositsCumulative,
    stEthWithdrawals,
    totalstEthWithdrawals,
    totalrEthWithdrawals,
    cummulativestEthWithdrawals,
    chartDataWithdrawalsDaily,
    chartDataWithdrawalsCumulative,
    chartDataSumStEth,
    chartDataSumREth,
    beaconChainStakes,
    totalBeaconChainStakes,
    cummulativeBeaconChainStakes,
    stakersBeaconChainConverted,
    stakersRethConverted,
    stakersStethConverted,
    groupedStakers,
    rEthRate,
  };
}
