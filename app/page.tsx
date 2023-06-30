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
  LeaderboardUserData,
  accumulateAmounts,
  extractAmountsAndTimestamps,
  extractAmountsAndTimestampsWithPrevious,
  mergeBlockChunks,
  roundToDecimalPlaces,
  subtractArrays,
  sumTotalAmounts,
} from "@/lib/utils";
import {
  RocketTokenRETH__factory,
  StakedTokenV1__factory,
  StrategyBaseTVLLimits__factory,
} from "@/typechain";
import Image from "next/image";
import Disclaimer from "./components/Disclaimer";

const MAINNET_RETH_ADDRESS = "0xae78736Cd615f374D3085123A210448E74Fc6393";
const MAINNET_CBETH_ADDRESS = "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704";
const TESTNET_RETH_ADDRESS = "0x178E141a0E3b34152f73Ff610437A7bf9B83267A";

const MAINNET_STETH_STRATEGY_ADDRESS =
  "0x93c4b944D05dfe6df7645A86cd2206016c51564D";
const MAINNET_CBETH_STRATEGY_ADDRESS =
  "0x54945180dB7943c0ed0FEE7EdaB2Bd24620256bc";
const MAINNET_RETH_STRATEGY_ADDRESS =
  "0x1BeE69b7dFFfA4E2d53C2a2Df135C388AD25dCD2";

const mainnetProvider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth");
const testnetProvider = new ethers.JsonRpcProvider(
  "https://rpc.ankr.com/eth_goerli"
);

const MAX_LEADERBOARD_SIZE = 50;

export default async function Home() {
  const {
    rEthDeposits,
    rEthTvl,
    cummulativerEthDeposits,
    stEthDeposits,
    stEthTvl,
    cummulativestEthDeposits,
    cbEthTvl,
    chartDataDepositsDaily,
    chartDataDepositsCumulative,
    stEthWithdrawals,
    cummulativestEthWithdrawals,
    chartDataWithdrawalsDaily,
    chartDataWithdrawalsCumulative,
    chartDataSumStEth,
    chartDataSumREth,
    beaconChainStakes,
    totalBeaconChainStakes,
    cummulativeBeaconChainStakes,
    stakersBeaconChainEthConverted,
    stakersRethConverted,
    stakersCbethConverted,
    stakersStethConverted,
    groupedStakers,
    rEthRate,
    cbEthRate,
    chartDataBeaconStakesDaily,
    chartDataBeaconStakesCumulative,
  } = await fetchData(true);

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
                stEthTvl,
                rEthTvl * rEthRate,
                cbEthTvl * cbEthRate,
                totalBeaconChainStakes,
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
            stethStakers: stakersStethConverted,
            rethStakers: stakersRethConverted,
            cbethStakers: stakersCbethConverted,
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

async function fetchData(isMainnet: boolean) {
  const provider = isMainnet ? mainnetProvider : testnetProvider;
  const rEthAddress = isMainnet ? MAINNET_RETH_ADDRESS : TESTNET_RETH_ADDRESS;

  const rEth = RocketTokenRETH__factory.connect(rEthAddress, provider);
  const rEthRate = Number(await rEth.getExchangeRate()) / 1e18;

  const cbEth = StakedTokenV1__factory.connect(MAINNET_CBETH_ADDRESS, provider);
  const cbEthRate = isMainnet ? Number(await cbEth.exchangeRate()) / 1e18 : 0;

  const stEthStrategy = StrategyBaseTVLLimits__factory.connect(
    MAINNET_STETH_STRATEGY_ADDRESS,
    provider
  );
  const rEthStrategy = StrategyBaseTVLLimits__factory.connect(
    MAINNET_RETH_STRATEGY_ADDRESS,
    provider
  );
  const cbEthStrategy = StrategyBaseTVLLimits__factory.connect(
    MAINNET_CBETH_STRATEGY_ADDRESS,
    provider
  );

  const stEthTvl =
    Number(
      await stEthStrategy.sharesToUnderlyingView(
        await stEthStrategy.totalShares()
      )
    ) / 1e18;
  const rEthTvl =
    Number(
      await rEthStrategy.sharesToUnderlyingView(
        await rEthStrategy.totalShares()
      )
    ) / 1e18;
  const cbEthTvl =
    Number(
      await cbEthStrategy.sharesToUnderlyingView(
        await cbEthStrategy.totalShares()
      )
    ) / 1e18;

  // Move to promise.all

  // Deposits
  const [rEthDeposits, stEthDeposits, cbEthDeposits, beaconChainStakes] = (
    await Promise.all([
      supabase
        .from(
          isMainnet
            ? "mainnet_consumabledailydepositsreth"
            : "consumabledailydepositsreth"
        )
        .select("*"),
      supabase
        .from(
          isMainnet
            ? "mainnet_consumabledailydepositssteth"
            : "consumabledailydepositssteth"
        )
        .select("*"),
      supabase.from("mainnet_consumabledailydepositscbeth").select("*"),
      supabase
        .from(
          isMainnet
            ? "mainnet_consumablebeaconchainstakeseth"
            : "consumablebeaconchainstakeseth"
        )
        .select("*")
        .limit(100),
    ])
  ).map((response) => response.data as BlockData[]);

  const [
    cummulativerEthDeposits,
    cummulativestEthDeposits,
    cummulativecbEthDeposits,
  ] = [
    accumulateAmounts(rEthDeposits),
    accumulateAmounts(stEthDeposits),
    accumulateAmounts(cbEthDeposits),
  ];

  const [totalBeaconChainStakes, cummulativeBeaconChainStakes] = [
    sumTotalAmounts(beaconChainStakes),
    accumulateAmounts(beaconChainStakes),
  ];

  // Deposits prepared for charts.
  let chartDataDepositsDaily = extractAmountsAndTimestamps(
    stEthDeposits,
    rEthDeposits,
    cbEthDeposits,
    beaconChainStakes
  );

  let chartDataDepositsCumulative = extractAmountsAndTimestampsWithPrevious(
    cummulativestEthDeposits,
    cummulativerEthDeposits,
    cummulativecbEthDeposits,
    cummulativeBeaconChainStakes
  );

  let chartDataBeaconStakesDaily =
    extractAmountsAndTimestamps(beaconChainStakes);

  let chartDataBeaconStakesCumulative = extractAmountsAndTimestampsWithPrevious(
    cummulativeBeaconChainStakes
  );

  // Withdrawals
  const [rEthWithdrawals, stEthWithdrawals, cbEthWithdrawals] = (
    await Promise.all([
      supabase
        .from(
          isMainnet
            ? "mainnet_consumabledailywithdrawalsreth"
            : "consumabledailywithdrawalsreth"
        )
        .select("*"),
      supabase
        .from(
          isMainnet
            ? "mainnet_consumabledailywithdrawalssteth"
            : "consumabledailywithdrawalssteth"
        )
        .select("*"),
      supabase.from("mainnet_consumabledailywithdrawalscbeth").select("*"),
    ])
  ).map((response) => response.data as BlockData[]);

  const [
    cummulativerEthWithdrawals,
    cummulativestEthWithdrawals,
    cummulativecbEthWithdrawals,
  ] = [
    accumulateAmounts(rEthWithdrawals),
    accumulateAmounts(stEthWithdrawals),
    accumulateAmounts(cbEthWithdrawals),
  ];

  // Withdrawals prepared for charts.
  let chartDataWithdrawalsDaily = extractAmountsAndTimestamps(
    stEthWithdrawals,
    rEthWithdrawals,
    cbEthWithdrawals
  );

  let chartDataWithdrawalsCumulative = extractAmountsAndTimestampsWithPrevious(
    cummulativestEthWithdrawals,
    cummulativerEthWithdrawals,
    cummulativecbEthWithdrawals
  );

  let sumStEth = subtractArrays(stEthDeposits, [stEthWithdrawals]);

  let sumREth = subtractArrays(rEthDeposits, [rEthWithdrawals]);

  let sumCbEth = subtractArrays(cbEthDeposits, [cbEthWithdrawals]);

  let chartDataSumStEth = extractAmountsAndTimestamps(
    subtractArrays(sumStEth, [sumREth, sumCbEth])
  );

  // let chartDataStEthCumulative = extractAmountsAndTimestampsWithPrevious(
  //   cummulativestEthDeposits,
  //   cummulativerEthDeposits
  // );

  let chartDataSumREth = extractAmountsAndTimestamps(
    subtractArrays(sumREth, [sumStEth, sumCbEth])
  );

  // let chartDataREthCumulative = extractAmountsAndTimestampsWithPrevious(
  //   cummulativerEthDeposits,
  //   cummulativestEthDeposits
  // );

  // LeaderBoard
  const { data: stakersBeaconChainEth } = (await supabase
    .from("mainnet_stakers_beaconchaineth_view")
    .select("*")
    .limit(MAX_LEADERBOARD_SIZE)) as unknown as {
    data: Array<{ depositor: string; total_staked: number }>;
  };

  const [stakersReth, stakersSteth, stakersCbeth] = (
    await Promise.all([
      supabase
        .from("mainnet_stakers_reth_view")
        .select("*")
        .limit(MAX_LEADERBOARD_SIZE),
      supabase
        .from("mainnet_stakers_steth_view")
        .select("*")
        .limit(MAX_LEADERBOARD_SIZE),
      supabase
        .from("mainnet_stakers_cbeth_view")
        .select("*")
        .limit(MAX_LEADERBOARD_SIZE),
    ])
  ).map(
    (d) =>
      d.data as Array<{
        depositor: string;
        total_staked_shares: number;
      }>
  );

  const rEthSharesRate =
    Number(await rEthStrategy.sharesToUnderlyingView(BigInt(1e18))) / 1e18;
  const stEthSharesRate =
    Number(await stEthStrategy.sharesToUnderlyingView(BigInt(1e18))) / 1e18;
  const cbEthSharesRate =
    Number(await cbEthStrategy.sharesToUnderlyingView(BigInt(1e18))) / 1e18;

  const stakersBeaconChainEthConverted: LeaderboardUserData[] =
    stakersBeaconChainEth.map((d) => ({
      depositor: d.depositor,
      totalStaked: d.total_staked,
    }));

  const stakersRethConverted: LeaderboardUserData[] = stakersReth.map((d) => ({
    depositor: d.depositor,
    totalStaked: d.total_staked_shares * rEthSharesRate * rEthRate,
  }));

  const stakersStethConverted: LeaderboardUserData[] = stakersSteth.map(
    (d) => ({
      depositor: d.depositor,
      totalStaked: d.total_staked_shares * stEthSharesRate,
    })
  );

  const stakersCbethConverted: LeaderboardUserData[] = stakersCbeth.map(
    (d) => ({
      depositor: d.depositor,
      totalStaked: d.total_staked_shares * cbEthSharesRate * cbEthRate,
    })
  );

  const groupedStakers = [
    ...stakersBeaconChainEthConverted,
    ...stakersRethConverted,
    ...stakersStethConverted,
    ...stakersCbethConverted,
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
    ...stakersRethConverted,
    ...stakersBeaconChainEthConverted,
    ...stakersStethConverted,
    ...stakersCbethConverted,
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
    cummulativerEthDeposits,
    stEthDeposits,
    stEthTvl,
    cummulativestEthDeposits,
    cbEthTvl,
    chartDataDepositsDaily,
    chartDataDepositsCumulative,
    stEthWithdrawals,
    cummulativestEthWithdrawals,
    chartDataWithdrawalsDaily,
    chartDataWithdrawalsCumulative,
    chartDataSumStEth,
    chartDataSumREth,
    beaconChainStakes,
    totalBeaconChainStakes,
    cummulativeBeaconChainStakes,
    stakersBeaconChainEthConverted,
    stakersRethConverted,
    stakersStethConverted,
    stakersCbethConverted,
    groupedStakers,
    rEthRate,
    cbEthRate,
    chartDataBeaconStakesDaily,
    chartDataBeaconStakesCumulative,
  };
}
