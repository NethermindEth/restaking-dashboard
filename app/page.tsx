import { ethers } from "ethers";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

import { supabase, supabaseUnwrap } from "../lib/supabaseClient";
import {
  RocketTokenRETH__factory,
  StakedTokenV1__factory,
  StrategyBaseTVLLimits__factory,
} from "@/typechain";
import { LeaderboardUserData, extractAmountsAndTimestamps } from "@/lib/utils";

import Dashboard from "./components/Dashboard";

const TESTNET_RETH_ADDRESS = "0x178E141a0E3b34152f73Ff610437A7bf9B83267A";
const MAINNET_RETH_ADDRESS = "0xae78736Cd615f374D3085123A210448E74Fc6393";
const MAINNET_CBETH_ADDRESS = "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704";
const MAINNET_STETH_STRATEGY_ADDRESS =
  "0x93c4b944D05dfe6df7645A86cd2206016c51564D";
const MAINNET_CBETH_STRATEGY_ADDRESS =
  "0x54945180dB7943c0ed0FEE7EdaB2Bd24620256bc";
const MAINNET_RETH_STRATEGY_ADDRESS =
  "0x1BeE69b7dFFfA4E2d53C2a2Df135C388AD25dCD2";
const mainnetProvider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth");
const testnetProvider = new ethers.JsonRpcProvider(
  '"https://rpc.ankr.com/eth_goerli"'
);
const MAX_LEADERBOARD_SIZE = 50;

export default async function Home() {
  const [mainnetData, goerliData] = await Promise.all([
    getDashboardData(true),
    getDashboardData(false),
  ]);
  return <Dashboard data={{ mainnet: mainnetData, goerli: goerliData }} />;
}

async function getDashboardData(isMainnet: boolean) {
  const provider = isMainnet ? mainnetProvider : testnetProvider;
  const rEth = RocketTokenRETH__factory.connect(
    isMainnet ? MAINNET_RETH_ADDRESS : TESTNET_RETH_ADDRESS,
    provider
  );
  const rEthRate = Number(await rEth.getExchangeRate()) / 1e18;

  const cbEth = StakedTokenV1__factory.connect(MAINNET_CBETH_ADDRESS, provider);
  const cbEthRate = Number(await cbEth.exchangeRate()) / 1e18;

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

  const rEthDeposits =
    supabaseUnwrap(await supabase.from("DailyRETHDeposits").select("*")) || [];

  const stEthDeposits =
    supabaseUnwrap(await supabase.from("DailyStETHDeposits").select("*")) || [];

  const cbEthDeposits =
    supabaseUnwrap(await supabase.from("DailyCbETHDeposits").select("*")) || [];

  const cumulativeREthDeposits =
    supabaseUnwrap(
      await supabase.from("CumulativeDailyRETHDeposits").select("*")
    ) || [];

  const cumulativeStEthDeposits =
    supabaseUnwrap(
      await supabase.from("CumulativeDailyStETHDeposits").select("*")
    ) || [];

  const cumulativeCbEthDeposits =
    supabaseUnwrap(
      await supabase.from("CumulativeDailyCbETHDeposits").select("*")
    ) || [];

  const beaconChainEthDeposits =
    supabaseUnwrap(
      await supabase.from("DailyBeaconChainETHDeposits").select("*")
    ) || [];

  const cumulativeBeaconChainEthDeposits =
    supabaseUnwrap(
      await supabase.from("CumulativeDailyBeaconChainETHDeposits").select("*")
    ) || [];

  const rEthWithdrawals =
    supabaseUnwrap(await supabase.from("DailyRETHWithdrawals").select("*")) ||
    [];

  const stEthWithdrawals =
    supabaseUnwrap(await supabase.from("DailyStETHWithdrawals").select("*")) ||
    [];

  const cbEthWithdrawals =
    supabaseUnwrap(await supabase.from("DailyCbETHWithdrawals").select("*")) ||
    [];

  const cumulativeREthWithdrawals =
    supabaseUnwrap(
      await supabase.from("CumulativeDailyRETHWithdrawals").select("*")
    ) || [];

  const cumulativeStEthWithdrawals =
    supabaseUnwrap(
      await supabase.from("CumulativeDailyStETHWithdrawals").select("*")
    ) || [];

  const cumulativeCbEthWithdrawals =
    supabaseUnwrap(
      await supabase.from("CumulativeDailyCbETHWithdrawals").select("*")
    ) || [];

  const beaconChainEthWithdrawals =
    supabaseUnwrap(
      await supabase.from("DailyBeaconChainETHWithdrawals").select("*")
    ) || [];

  const cumulativeBeaconChainEthWithdrawals =
    supabaseUnwrap(
      await supabase
        .from("CumulativeDailyBeaconChainETHWithdrawals")
        .select("*")
    ) || [];

  const totalStakedBeaconChainEth =
    supabaseUnwrap(await supabase.from("StakedBeaconChainETH").select("*"))![0]
      .amount || 0;

  const chartDataDepositsDaily = extractAmountsAndTimestamps(
    stEthDeposits,
    rEthDeposits,
    cbEthDeposits,
    beaconChainEthDeposits
  );

  const chartDataDepositsCumulative = extractAmountsAndTimestamps(
    cumulativeStEthDeposits,
    cumulativeREthDeposits,
    cumulativeCbEthDeposits,
    cumulativeBeaconChainEthDeposits
  );

  const chartDataBeaconStakesDaily = extractAmountsAndTimestamps(
    beaconChainEthDeposits
  );

  const chartDataBeaconStakesCumulative = extractAmountsAndTimestamps(
    cumulativeBeaconChainEthDeposits
  );

  const chartDataWithdrawalsDaily = extractAmountsAndTimestamps(
    stEthWithdrawals,
    rEthWithdrawals,
    cbEthWithdrawals
  );

  const chartDataWithdrawalsCumulative = extractAmountsAndTimestamps(
    cumulativeStEthWithdrawals,
    cumulativeREthWithdrawals,
    cumulativeCbEthWithdrawals
  );

  const stakersBeaconChainEth =
    supabaseUnwrap(
      await supabase
        .from("StakersBeaconChainETHShares")
        .select("*")
        .order("total_staked_shares", { ascending: false })
        .limit(MAX_LEADERBOARD_SIZE)
    ) || [];

  const stakersREth =
    supabaseUnwrap(
      await supabase
        .from("StakersRETHShares")
        .select("*")
        .order("total_staked_shares", { ascending: false })
        .limit(MAX_LEADERBOARD_SIZE)
    ) || [];

  const stakersCbEth =
    supabaseUnwrap(
      await supabase
        .from("StakersCbETHShares")
        .select("*")
        .order("total_staked_shares", { ascending: false })
        .limit(MAX_LEADERBOARD_SIZE)
    ) || [];

  const stakersStEth =
    supabaseUnwrap(
      await supabase
        .from("StakersStETHShares")
        .select("*")
        .order("total_staked_shares", { ascending: false })
        .limit(MAX_LEADERBOARD_SIZE)
    ) || [];

  const rEthSharesRate =
    Number(await rEthStrategy.sharesToUnderlyingView(BigInt(1e18))) / 1e18;
  const stEthSharesRate =
    Number(await stEthStrategy.sharesToUnderlyingView(BigInt(1e18))) / 1e18;
  const cbEthSharesRate =
    Number(await cbEthStrategy.sharesToUnderlyingView(BigInt(1e18))) / 1e18;

  const stakersBeaconChainEthConverted: LeaderboardUserData[] =
    stakersBeaconChainEth.map((d) => ({
      depositor: d.depositor!,
      totalStaked: d.total_staked_shares!,
    }));

  const stakersREthConverted: LeaderboardUserData[] = stakersREth.map((d) => ({
    depositor: d.depositor!,
    totalStaked: d.total_staked_shares! * rEthSharesRate * rEthRate,
  }));

  const stakersStEthConverted: LeaderboardUserData[] = stakersStEth.map(
    (d) => ({
      depositor: d.depositor!,
      totalStaked: d.total_staked_shares! * stEthSharesRate,
    })
  );

  const stakersCbEthConverted: LeaderboardUserData[] = stakersCbEth.map(
    (d) => ({
      depositor: d.depositor!,
      totalStaked: d.total_staked_shares! * cbEthSharesRate * cbEthRate,
    })
  );

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

  const allStakerData = [
    ...stakersREthConverted,
    ...stakersBeaconChainEthConverted,
    ...stakersStEthConverted,
    ...stakersCbEthConverted,
    ...groupedStakers,
  ];

  const stakerEnsNames = Object.fromEntries(
    await Promise.all(
      Array.from(new Set(allStakerData.map((el) => el.depositor))).map(
        async (depositor) => {
          return [depositor, await provider.lookupAddress(depositor)];
        }
      )
    )
  );

  allStakerData.forEach((entry) => {
    entry.depositor = stakerEnsNames[entry.depositor] ?? entry.depositor;
  });

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
