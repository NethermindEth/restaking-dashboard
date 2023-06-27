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

const RETH_ADDRESS = "0xae78736Cd615f374D3085123A210448E74Fc6393";
const CBETH_ADDRESS = "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704";
const STETH_STRATEGY_ADDRESS = "0x93c4b944D05dfe6df7645A86cd2206016c51564D";
const CBETH_STRATEGY_ADDRESS = "0x54945180dB7943c0ed0FEE7EdaB2Bd24620256bc";
const RETH_STRATEGY_ADDRESS = "0x1BeE69b7dFFfA4E2d53C2a2Df135C388AD25dCD2";
const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth");
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
    stakersBeaconChainEth,
    stakersRethConverted,
    stakersCbethConverted,
    stakersStethConverted,
    groupedStakers,
    rEthRate,
    cbEthRate,
    chartDataBeaconStakesDaily,
    chartDataBeaconStakesCumulative,
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
            beaconchainethStakers: stakersBeaconChainEth,
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

async function getDeposits() {
  const rEth = RocketTokenRETH__factory.connect(RETH_ADDRESS, provider);
  const rEthRate = Number(await rEth.getExchangeRate()) / 1e18;

  const cbEth = StakedTokenV1__factory.connect(CBETH_ADDRESS, provider);
  const cbEthRate = Number(await cbEth.exchangeRate()) / 1e18;

  const stEthStrategy = StrategyBaseTVLLimits__factory.connect(
    STETH_STRATEGY_ADDRESS,
    provider
  );
  const rEthStrategy = StrategyBaseTVLLimits__factory.connect(
    RETH_STRATEGY_ADDRESS,
    provider
  );
  const cbEthStrategy = StrategyBaseTVLLimits__factory.connect(
    CBETH_STRATEGY_ADDRESS,
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
  let { data: rEthDeposits, error: rEthDepositError } = await supabase
    .from("mainnet_consumabledailydepositsreth")
    .select("*");
  rEthDeposits = mergeBlockChunks(rEthDeposits as BlockData[]);
  let cummulativerEthDeposits = accumulateAmounts(rEthDeposits as BlockData[]);

  let { data: stEthDeposits, error: stEthDepositError } = await supabase
    .from("mainnet_consumabledailydepositssteth")
    .select("*");
  stEthDeposits = mergeBlockChunks(stEthDeposits as BlockData[]);
  let cummulativestEthDeposits = accumulateAmounts(
    stEthDeposits as BlockData[]
  );

  let { data: cbEthDeposits, error: cbEthDepositError } = await supabase
    .from("mainnet_consumabledailydepositscbeth")
    .select("*");
  cbEthDeposits = mergeBlockChunks(cbEthDeposits as BlockData[]);
  let cummulativecbEthDeposits = accumulateAmounts(
    cbEthDeposits as BlockData[]
  );

  let { data: beaconChainStakes } = await supabase
    .from("mainnet_consumablebeaconchainstakeseth")
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
    cbEthDeposits as BlockData[],
    beaconChainStakes as BlockData[]
  );

  let chartDataDepositsCumulative = extractAmountsAndTimestampsWithPrevious(
    cummulativestEthDeposits,
    cummulativerEthDeposits,
    cummulativecbEthDeposits,
    cummulativeBeaconChainStakes
  );

  let chartDataBeaconStakesDaily = extractAmountsAndTimestamps(
    beaconChainStakes as BlockData[]
  );

  let chartDataBeaconStakesCumulative = extractAmountsAndTimestampsWithPrevious(
    cummulativeBeaconChainStakes
  );

  // Withdrawals
  let { data: rEthWithdrawals, error: rEthWithDrawalsError } = await supabase
    .from("mainnet_consumabledailywithdrawalsreth")
    .select("*");
  rEthWithdrawals = mergeBlockChunks(rEthWithdrawals as BlockData[]);
  let cummulativerEthWithdrawals = accumulateAmounts(
    rEthWithdrawals as BlockData[]
  );

  let { data: stEthWithdrawals, error: stEthWithDrawalsError } = await supabase
    .from("mainnet_consumabledailywithdrawalssteth")
    .select("*");
  stEthWithdrawals = mergeBlockChunks(stEthWithdrawals as BlockData[]);
  let cummulativestEthWithdrawals = accumulateAmounts(
    stEthWithdrawals as BlockData[]
  );

  let { data: cbEthWithdrawals, error: cbEthWithDrawalsError } = await supabase
    .from("mainnet_consumabledailywithdrawalscbeth")
    .select("*");
  cbEthWithdrawals = mergeBlockChunks(cbEthWithdrawals as BlockData[]);
  let cummulativecbEthWithdrawals = accumulateAmounts(
    cbEthWithdrawals as BlockData[]
  );

  // Withdrawals prepared for charts.
  let chartDataWithdrawalsDaily = extractAmountsAndTimestamps(
    stEthWithdrawals as BlockData[],
    rEthWithdrawals as BlockData[],
    cbEthWithdrawals as BlockData[]
  );

  let chartDataWithdrawalsCumulative = extractAmountsAndTimestampsWithPrevious(
    cummulativestEthWithdrawals,
    cummulativerEthWithdrawals,
    cummulativecbEthWithdrawals
  );

  let sumStEth = subtractArrays(stEthDeposits as BlockData[], [
    stEthWithdrawals as BlockData[],
  ]);

  let sumREth = subtractArrays(rEthDeposits as BlockData[], [
    rEthWithdrawals as BlockData[],
  ]);

  let sumCbEth = subtractArrays(cbEthDeposits as BlockData[], [
    cbEthWithdrawals as BlockData[],
  ]);

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
  let { data: stakersBeaconChainEth } = (await supabase
    .from("temp_mainnet_beaconchainethstakers_view")
    .select("*")) as { data: UserData[] };
  let { data: stakersReth } = (await supabase
    .from("temp_mainnet_rethstakers_view")
    .select("*")) as { data: UserData[] };
  let { data: stakersSteth } = (await supabase
    .from("temp_mainnet_stethstakers_view")
    .select("*")) as { data: UserData[] };
  let { data: stakersCbeth } = (await supabase
    .from("temp_mainnet_cbethstakers_view")
    .select("*")) as { data: UserData[] };

  const rEthSharesRate = await rEthStrategy.sharesToUnderlyingView(
    BigInt(1e18)
  );
  const stEthSharesRate = await stEthStrategy.sharesToUnderlyingView(
    BigInt(1e18)
  );
  const cbEthSharesRate = await cbEthStrategy.sharesToUnderlyingView(
    BigInt(1e18)
  );

  let stakersRethConverted = (stakersReth as UserData[]).map((d) => ({
    depositor: d.depositor,
    total_deposits:
      (Number(rEthSharesRate) * d.total_deposits * rEthRate) / 1e18,
  }));

  let stakersStethConverted = stakersSteth.map((d) => ({
    depositor: d.depositor,
    total_deposits: (Number(stEthSharesRate) * d.total_deposits) / 1e18,
  }));

  let stakersCbethConverted = (stakersCbeth as UserData[]).map((d) => ({
    depositor: d.depositor,
    total_deposits:
      (Number(cbEthSharesRate) * d.total_deposits * cbEthRate) / 1e18,
  }));

  let groupedStakers = [
    ...(stakersBeaconChainEth as UserData[]),
    ...(stakersRethConverted as UserData[]),
    ...(stakersStethConverted as UserData[]),
    ...(stakersCbethConverted as UserData[]),
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

  stakersRethConverted = stakersRethConverted.slice(0, MAX_LEADERBOARD_SIZE);
  stakersCbethConverted = stakersCbethConverted.slice(0, MAX_LEADERBOARD_SIZE);
  stakersBeaconChainEth = stakersBeaconChainEth.slice(0, MAX_LEADERBOARD_SIZE);
  stakersStethConverted = stakersStethConverted.slice(0, MAX_LEADERBOARD_SIZE);
  groupedStakers = groupedStakers.slice(0, MAX_LEADERBOARD_SIZE);

  const allData = [
    ...stakersRethConverted,
    ...stakersBeaconChainEth,
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
    stakersBeaconChainEth,
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
