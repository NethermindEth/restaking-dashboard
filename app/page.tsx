import { ethers } from "ethers";
import { Inter } from "next/font/google";
import LineChart from "./components/charts/LineChart";
import PieChart from "./components/charts/PieChart";
import StackedBar from "./components/charts/StackedBar";
import LeaderBoard from "./components/leaderboard";

const inter = Inter({ subsets: ["latin"] });

import { supabase, supabaseUnwrap } from "../lib/supabaseClient";
import {
  RocketTokenRETH__factory,
  StakedTokenV1__factory,
  StrategyBaseTVLLimits__factory,
} from "@/typechain";
import { LeaderboardUserData, extractAmountsAndTimestamps, roundToDecimalPlaces } from "@/lib/utils";
import Image from "next/image";
import Disclaimer from "./components/Disclaimer";

const RETH_ADDRESS = "0xae78736Cd615f374D3085123A210448E74Fc6393";
const CBETH_ADDRESS = "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704";
const STETH_STRATEGY_ADDRESS = "0x93c4b944D05dfe6df7645A86cd2206016c51564D";
const CBETH_STRATEGY_ADDRESS = "0x54945180dB7943c0ed0FEE7EdaB2Bd24620256bc";
const RETH_STRATEGY_ADDRESS = "0x1BeE69b7dFFfA4E2d53C2a2Df135C388AD25dCD2";
const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth");
const MAX_LEADERBOARD_SIZE = 50;

export default async function Home() {
  const {
    rEthTvl,
    stEthTvl,
    cbEthTvl,
    chartDataDepositsDaily,
    chartDataDepositsCumulative,
    chartDataWithdrawalsDaily,
    chartDataWithdrawalsCumulative,
    totalStakedBeaconChainEth,
    stakersBeaconChainEthConverted,
    stakersREthConverted,
    stakersCbEthConverted,
    stakersStEthConverted,
    groupedStakers,
    rEthRate,
    cbEthRate,
    chartDataBeaconStakesDaily,
    chartDataBeaconStakesCumulative,
  } = await getDashboardData();

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
          <p className="text-lg md:text-2xl ml-4">EigenLayer Stats</p>
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
          <p className="md:text-xl">{roundToDecimalPlaces(stEthTvl)}</p>
        </div>
        <div className="data-card data-card-reth grow mt-8 lg:mt-0 py-8 px-10 md:px-24 mx-4 shadow-lg rounded-md text-center">
          <span className="inline-block ">
            <Image src={"/reth.webp"} alt="rETH" width={48} height={48} />
          </span>
          <p className="text-sm md:text-base">Staked rETH</p>
          <p className="md:text-xl">{roundToDecimalPlaces(rEthTvl)}</p>
        </div>
        <div className="data-card data-card-cbeth grow mt-8 lg:mt-0 py-8 px-10 md:px-24 mx-4 shadow-lg rounded-md text-center">
          <span className="inline-block ">
            <Image src={"/cbeth.png"} alt="cbETH" width={48} height={48} />
          </span>
          <p className="text-sm md:text-base">Staked cbETH</p>
          <p className="md:text-xl">{roundToDecimalPlaces(cbEthTvl)}</p>
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
            {roundToDecimalPlaces(totalStakedBeaconChainEth)}
          </p>
        </div>
      </div>

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
                namedLabels: ["stETH", "rETH", "cbETH"],
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
                namedLabels: ["stETH", "rETH", "cbETH"],
              }}
              title="Deposited tokens by day"
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
                namedLabels: ["stETH", "rETH", "cbETH"],
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
                namedLabels: ["stETH", "rETH", "cbETH"],
              }}
              title="Token Withdrawals by day"
            />
          </div>
        </div>

        <div className="charts-homepage mt-16">
          <h3 className="text-center text-xl">
            Cumulative Beacon Chain ETH in EigenPods by day
          </h3>
          <div className="chart-2">
            <LineChart
              data={{
                title: "Cumulative Token Withdrawals by day",
                amounts: chartDataBeaconStakesCumulative.amounts,
                timestamps: chartDataBeaconStakesCumulative.timestamps,
                namedLabels: ["ETH"],
              }}
            />
          </div>
        </div>

        <div className="charts-homepage mt-16">
          <h3 className="text-center text-xl">
            Added Beacon Chain ETH to EigenPods by day
          </h3>
          <div className="chart-staked-lst-date">
            <StackedBar
              data={{
                amounts: chartDataBeaconStakesDaily.amounts,
                labels: chartDataBeaconStakesDaily.timestamps,
                namedLabels: ["ETH"],
              }}
              title="Token Withdrawals by day"
            />
          </div>
        </div>

        <div className="charts-homepage pie-chart-deposits w-full md:w-1/3 mx-auto mt-16">
          <h3 className="text-center text-xl">Deposited tokens</h3>
          <PieChart
            data={{
              amounts: [
                stEthTvl,
                rEthTvl * rEthRate,
                cbEthTvl * cbEthRate,
                totalStakedBeaconChainEth,
              ],
              labels: [
                "stETH",
                "rETH (as ETH)",
                "cbETH (as ETH)",
                "Beacon Chain ETH",
              ],
            }}
          />
        </div>

        <LeaderBoard
          boardData={{
            ethStakers: groupedStakers,
            stethStakers: stakersStEthConverted,
            rethStakers: stakersREthConverted,
            cbethStakers: stakersCbEthConverted,
            beaconchainethStakers: stakersBeaconChainEthConverted,
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
        <Disclaimer />
      </div>
    </main>
  );
}

async function getDashboardData() {
  const rEth = RocketTokenRETH__factory.connect(RETH_ADDRESS, provider);
  const rEthRate = Number(await rEth.getExchangeRate()) / 1e18;

  const cbEth = StakedTokenV1__factory.connect(CBETH_ADDRESS, provider);
  const cbEthRate = Number(await cbEth.exchangeRate()) / 1e18;

  const stEthStrategy = StrategyBaseTVLLimits__factory.connect(STETH_STRATEGY_ADDRESS, provider);
  const rEthStrategy = StrategyBaseTVLLimits__factory.connect(RETH_STRATEGY_ADDRESS, provider);
  const cbEthStrategy = StrategyBaseTVLLimits__factory.connect(CBETH_STRATEGY_ADDRESS, provider);

  const stEthTvl = Number(await stEthStrategy.sharesToUnderlyingView(await stEthStrategy.totalShares())) / 1e18;
  const rEthTvl = Number(await rEthStrategy.sharesToUnderlyingView(await rEthStrategy.totalShares())) / 1e18;
  const cbEthTvl = Number(await cbEthStrategy.sharesToUnderlyingView(await cbEthStrategy.totalShares())) / 1e18;

  const rEthDeposits = supabaseUnwrap(
    await supabase
      .from("DailyRETHDeposits")
      .select("*")
  ) || [];

  const stEthDeposits = supabaseUnwrap(
    await supabase
      .from("DailyStETHDeposits")
      .select("*")
  ) || [];

  const cbEthDeposits = supabaseUnwrap(
    await supabase
      .from("DailyCbETHDeposits")
      .select("*")
  ) || [];

  const cumulativeREthDeposits = supabaseUnwrap(
    await supabase
      .from("CumulativeDailyRETHDeposits")
      .select("*")
  ) || [];

  const cumulativeStEthDeposits = supabaseUnwrap(
    await supabase
      .from("CumulativeDailyStETHDeposits")
      .select("*")
  ) || [];

  const cumulativeCbEthDeposits = supabaseUnwrap(
    await supabase
      .from("CumulativeDailyCbETHDeposits")
      .select("*")
  ) || [];

  const beaconChainEthDeposits = supabaseUnwrap(
    await supabase
      .from("DailyBeaconChainETHDeposits")
      .select("*")
  ) || [];

  const cumulativeBeaconChainEthDeposits = supabaseUnwrap(
    await supabase
      .from("CumulativeDailyBeaconChainETHDeposits")
      .select("*")
  ) || [];

  const rEthWithdrawals = supabaseUnwrap(
    await supabase
      .from("DailyRETHWithdrawals")
      .select("*")
  ) || [];

  const stEthWithdrawals = supabaseUnwrap(
    await supabase
      .from("DailyStETHWithdrawals")
      .select("*")
  ) || [];

  const cbEthWithdrawals = supabaseUnwrap(
    await supabase
      .from("DailyCbETHWithdrawals")
      .select("*")
  ) || [];

  const cumulativeREthWithdrawals = supabaseUnwrap(
    await supabase
      .from("CumulativeDailyRETHWithdrawals")
      .select("*")
  ) || [];

  const cumulativeStEthWithdrawals = supabaseUnwrap(
    await supabase
      .from("CumulativeDailyStETHWithdrawals")
      .select("*")
  ) || [];

  const cumulativeCbEthWithdrawals = supabaseUnwrap(
    await supabase
      .from("CumulativeDailyCbETHWithdrawals")
      .select("*")
  ) || [];

  const beaconChainEthWithdrawals = supabaseUnwrap(
    await supabase
      .from("DailyBeaconChainETHWithdrawals")
      .select("*")
  ) || [];

  const cumulativeBeaconChainEthWithdrawals = supabaseUnwrap(
    await supabase
      .from("CumulativeDailyBeaconChainETHWithdrawals")
      .select("*")
  ) || [];

  const totalStakedBeaconChainEth = supabaseUnwrap(
    await supabase
      .from("StakedBeaconChainETH")
      .select("*")
  )![0].amount || 0;

  const chartDataDepositsDaily = extractAmountsAndTimestamps(
    stEthDeposits,
    rEthDeposits,
    cbEthDeposits,
    beaconChainEthDeposits,
  );

  const chartDataDepositsCumulative = extractAmountsAndTimestamps(
    cumulativeStEthDeposits,
    cumulativeREthDeposits,
    cumulativeCbEthDeposits,
    cumulativeBeaconChainEthDeposits
  );

  const chartDataBeaconStakesDaily = extractAmountsAndTimestamps(beaconChainEthDeposits);

  const chartDataBeaconStakesCumulative = extractAmountsAndTimestamps(cumulativeBeaconChainEthDeposits);

  const chartDataWithdrawalsDaily = extractAmountsAndTimestamps(
    stEthWithdrawals,
    rEthWithdrawals,
    cbEthWithdrawals,
  );

  const chartDataWithdrawalsCumulative = extractAmountsAndTimestamps(
    cumulativeStEthWithdrawals,
    cumulativeREthWithdrawals,
    cumulativeCbEthWithdrawals
  );

  const stakersBeaconChainEth = supabaseUnwrap(
    await supabase
      .from("StakersBeaconChainETHShares")
      .select("*")
      .order("total_staked_shares", { ascending: false })
      .limit(MAX_LEADERBOARD_SIZE)
  ) || [];

  const stakersREth = supabaseUnwrap(
    await supabase
      .from("StakersRETHShares")
      .select("*")
      .order("total_staked_shares", { ascending: false })
      .limit(MAX_LEADERBOARD_SIZE)
  ) || [];

  const stakersCbEth = supabaseUnwrap(
    await supabase
      .from("StakersCbETHShares")
      .select("*")
      .order("total_staked_shares", { ascending: false })
      .limit(MAX_LEADERBOARD_SIZE)
  ) || [];

  const stakersStEth = supabaseUnwrap(
    await supabase
      .from("StakersStETHShares")
      .select("*")
      .order("total_staked_shares", { ascending: false })
      .limit(MAX_LEADERBOARD_SIZE)
  ) || [];

  const rEthSharesRate = Number(await rEthStrategy.sharesToUnderlyingView(BigInt(1e18))) / 1e18;
  const stEthSharesRate = Number(await stEthStrategy.sharesToUnderlyingView(BigInt(1e18))) / 1e18;
  const cbEthSharesRate = Number(await cbEthStrategy.sharesToUnderlyingView(BigInt(1e18))) / 1e18;

  const stakersBeaconChainEthConverted: LeaderboardUserData[] = stakersBeaconChainEth.map((d) => ({
    depositor: d.depositor!,
    totalStaked: d.total_staked_shares!,
  }));

  const stakersREthConverted: LeaderboardUserData[] = stakersREth.map((d) => ({
    depositor: d.depositor!,
    totalStaked: d.total_staked_shares! * rEthSharesRate * rEthRate,
  }));

  const stakersStEthConverted: LeaderboardUserData[] = stakersStEth.map((d) => ({
    depositor: d.depositor!,
    totalStaked: d.total_staked_shares! * stEthSharesRate,
  }));

  const stakersCbEthConverted: LeaderboardUserData[] = stakersCbEth.map((d) => ({
    depositor: d.depositor!,
    totalStaked: d.total_staked_shares! * cbEthSharesRate * cbEthRate,
  }));

  const groupedStakers = [
    ...stakersBeaconChainEthConverted,
    ...stakersREthConverted,
    ...stakersStEthConverted,
    ...stakersCbEthConverted,
  ]
    .reduce((acc, cur) => {
      const existingDepositor = acc.find(
        (d: LeaderboardUserData) => d.depositor === cur.depositor
      );
      existingDepositor
        ? (existingDepositor.totalStaked += cur.totalStaked)
        : acc.push({ ...cur });
      return acc;
    }, [] as LeaderboardUserData[])
    .sort((a, b) => b.totalStaked - a.totalStaked)
    .slice(0, MAX_LEADERBOARD_SIZE);

  const allData = [
    ...stakersREthConverted,
    ...stakersBeaconChainEthConverted,
    ...stakersStEthConverted,
    ...stakersCbEthConverted,
    ...groupedStakers,
  ];

  const allDepositors = Array.from(
    new Set(allData.map(({ depositor }) => depositor))
  );

  const lookupPromises = allDepositors.map((depositor) =>
    provider.lookupAddress(depositor)
  );

  const resolvedAddresses = await Promise.all(lookupPromises);

  allData.map(
    (data, index) =>
      (data.depositor = resolvedAddresses[index] ?? data.depositor)
  );

  return {
    rEthDeposits,
    rEthTvl,
    stEthDeposits,
    stEthTvl,
    cbEthTvl,
    chartDataDepositsDaily,
    chartDataDepositsCumulative,
    stEthWithdrawals,
    chartDataWithdrawalsDaily,
    chartDataWithdrawalsCumulative,
    beaconChainEthDeposits,
    totalStakedBeaconChainEth,
    stakersBeaconChainEthConverted,
    stakersREthConverted,
    stakersStEthConverted,
    stakersCbEthConverted,
    groupedStakers,
    rEthRate,
    cbEthRate,
    chartDataBeaconStakesDaily,
    chartDataBeaconStakesCumulative,
  };
}
