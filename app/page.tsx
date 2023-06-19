import { ethers } from "ethers";
import { Inter } from "next/font/google";
import MainPage from "./components/Main";

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
import { RocketTokenRETH__factory, StakedTokenV1__factory } from "@/typechain";

const MAINNET_RETH_ADDRESS = "0xae78736Cd615f374D3085123A210448E74Fc6393";
const MAINNET_CBETH_ADDRESS = "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704";
const TESTNET_RETH_ADDRESS = "0x178E141a0E3b34152f73Ff610437A7bf9B83267A";

const mainnetProvider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth");
const testnetProvider = new ethers.JsonRpcProvider(
  "https://rpc.ankr.com/eth_goerli"
);

const MAX_LEADERBOARD_SIZE = 50;

export default async function Home() {
  const [mainnetData, goerliData] = await Promise.all([
    getDeposits(true),
    getDeposits(false),
  ]);

  return (
    <MainPage data={{ mainnet: mainnetData, goerli: goerliData }}></MainPage>
  );
}

async function getDeposits(isMainnet: boolean) {
  const provider = isMainnet ? mainnetProvider : testnetProvider;
  const rEthAddress = isMainnet ? MAINNET_RETH_ADDRESS : TESTNET_RETH_ADDRESS;

  const rEth = RocketTokenRETH__factory.connect(rEthAddress, provider);
  const rEthRate = Number(await rEth.getExchangeRate()) / 1e18;

  const cbEth = StakedTokenV1__factory.connect(MAINNET_CBETH_ADDRESS, provider);
  const cbEthRate = isMainnet ? Number(await cbEth.exchangeRate()) / 1e18 : 0;

  // Move to promise.all

  // Deposits
  let { data: rEthDeposits, error: rEthDepositError } = await supabase
    .from(
      isMainnet
        ? "mainnet_consumabledailydepositsreth"
        : "consumabledailydepositsreth"
    )
    .select("*");
  rEthDeposits = mergeBlockChunks(rEthDeposits as BlockData[]);
  let totalrEthDeposits = sumTotalAmounts(rEthDeposits as BlockData[]);
  let cummulativerEthDeposits = accumulateAmounts(rEthDeposits as BlockData[]);

  let { data: stEthDeposits, error: stEthDepositError } = await supabase
    .from(
      isMainnet
        ? "mainnet_consumabledailydepositssteth"
        : "consumabledailydepositssteth"
    )
    .select("*");
  stEthDeposits = mergeBlockChunks(stEthDeposits as BlockData[]);
  let totalstEthDeposits = sumTotalAmounts(stEthDeposits as BlockData[]);
  let cummulativestEthDeposits = accumulateAmounts(
    stEthDeposits as BlockData[]
  );

  let { data: cbEthDeposits, error: cbEthDepositError } = await supabase
    .from("mainnet_consumabledailydepositscbeth")
    .select("*");
  cbEthDeposits = mergeBlockChunks(cbEthDeposits as BlockData[]);
  let totalcbEthDeposits = sumTotalAmounts(cbEthDeposits as BlockData[]);
  let cummulativecbEthDeposits = accumulateAmounts(
    cbEthDeposits as BlockData[]
  );

  let { data: beaconChainStakes } = await supabase
    .from(
      isMainnet
        ? "mainnet_consumablebeaconchainstakeseth"
        : "consumablebeaconchainstakeseth"
    )
    .select("*")
    .limit(100);

  beaconChainStakes = mergeBlockChunks(beaconChainStakes as BlockData[]);
  let totalBeaconChainStakes = sumTotalAmounts(
    beaconChainStakes as BlockData[]
  );
  let cummulativeBeaconChainStakes = accumulateAmounts(
    beaconChainStakes as BlockData[]
  );

  // Deposits prepared for charts.
  let chartDataDepositsDaily = isMainnet
    ? extractAmountsAndTimestamps(
        stEthDeposits as BlockData[],
        rEthDeposits as BlockData[],
        cbEthDeposits as BlockData[],
        beaconChainStakes as BlockData[]
      )
    : extractAmountsAndTimestamps(
        stEthDeposits as BlockData[],
        rEthDeposits as BlockData[],
        beaconChainStakes as BlockData[]
      );

  let chartDataDepositsCumulative = isMainnet
    ? extractAmountsAndTimestampsWithPrevious(
        cummulativestEthDeposits,
        cummulativerEthDeposits,
        cummulativecbEthDeposits,
        cummulativeBeaconChainStakes
      )
    : extractAmountsAndTimestampsWithPrevious(
        cummulativestEthDeposits,
        cummulativerEthDeposits,
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
    .from(
      isMainnet
        ? "mainnet_consumabledailywithdrawalsreth"
        : "consumabledailywithdrawalsreth"
    )
    .select("*");
  rEthWithdrawals = mergeBlockChunks(rEthWithdrawals as BlockData[]);
  let totalrEthWithdrawals = sumTotalAmounts(rEthWithdrawals as BlockData[]);
  let cummulativerEthWithdrawals = accumulateAmounts(
    rEthWithdrawals as BlockData[]
  );

  let { data: stEthWithdrawals, error: stEthWithDrawalsError } = await supabase
    .from(
      isMainnet
        ? "mainnet_consumabledailywithdrawalssteth"
        : "consumabledailywithdrawalssteth"
    )
    .select("*");
  stEthWithdrawals = mergeBlockChunks(stEthWithdrawals as BlockData[]);
  let totalstEthWithdrawals = sumTotalAmounts(stEthWithdrawals as BlockData[]);
  let cummulativestEthWithdrawals = accumulateAmounts(
    stEthWithdrawals as BlockData[]
  );

  let { data: cbEthWithdrawals, error: cbEthWithDrawalsError } = await supabase
    .from("mainnet_consumabledailywithdrawalscbeth")
    .select("*");
  cbEthWithdrawals = mergeBlockChunks(cbEthWithdrawals as BlockData[]);
  let totalcbEthWithdrawals = sumTotalAmounts(cbEthWithdrawals as BlockData[]);
  let cummulativecbEthWithdrawals = accumulateAmounts(
    cbEthWithdrawals as BlockData[]
  );

  // Withdrawals prepared for charts.
  let chartDataWithdrawalsDaily = extractAmountsAndTimestamps(
    stEthWithdrawals as BlockData[],
    rEthWithdrawals as BlockData[],
    cbEthWithdrawals as BlockData[]
  );

  let chartDataWithdrawalsCumulative = isMainnet
    ? extractAmountsAndTimestampsWithPrevious(
        cummulativestEthWithdrawals,
        cummulativerEthWithdrawals,
        cummulativecbEthWithdrawals
      )
    : extractAmountsAndTimestampsWithPrevious(
        cummulativestEthWithdrawals,
        cummulativerEthWithdrawals
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
    .from(
      isMainnet
        ? "mainnet_stakers_beaconchaineth_deposits_view"
        : "stakers_beaconchaineth_deposits_view"
    )
    .select("*")) as { data: UserData[] };
  let { data: stakersReth } = (await supabase
    .from(
      isMainnet
        ? "mainnet_stakers_reth_deposits_view"
        : "stakers_reth_deposits_view"
    )
    .select("*")) as { data: UserData[] };
  let { data: stakersSteth } = (await supabase
    .from(
      isMainnet
        ? "mainnet_stakers_steth_deposits_view"
        : "stakers_steth_deposits_view"
    )
    .select("*")) as { data: UserData[] };
  let { data: stakersCbeth } = (await supabase
    .from("mainnet_stakers_cbeth_deposits_view")
    .select("*")) as { data: UserData[] };

  let stakersRethConverted = (stakersReth as UserData[]).map((d) => ({
    depositor: d.depositor,
    total_deposits: d.total_deposits * rEthRate,
  }));

  let stakersCbethConverted = (stakersCbeth as UserData[]).map((d) => ({
    depositor: d.depositor,
    total_deposits: d.total_deposits * cbEthRate,
  }));

  let groupedStakers = (
    isMainnet
      ? [
          ...(stakersBeaconChainEth as UserData[]),
          ...(stakersRethConverted as UserData[]),
          ...(stakersSteth as UserData[]),
          ...(stakersCbethConverted as UserData[]),
        ]
      : [
          ...(stakersBeaconChainEth as UserData[]),
          ...(stakersRethConverted as UserData[]),
          ...(stakersSteth as UserData[]),
        ]
  )
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
  stakersSteth = stakersSteth.slice(0, MAX_LEADERBOARD_SIZE);
  groupedStakers = groupedStakers.slice(0, MAX_LEADERBOARD_SIZE);

  const allData = [
    ...stakersRethConverted,
    ...stakersBeaconChainEth,
    ...stakersSteth,
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
    totalrEthDeposits,
    cummulativerEthDeposits,
    stEthDeposits,
    totalstEthDeposits,
    cummulativestEthDeposits,
    totalcbEthDeposits,
    chartDataDepositsDaily,
    chartDataDepositsCumulative,
    stEthWithdrawals,
    totalstEthWithdrawals,
    totalrEthWithdrawals,
    totalcbEthWithdrawals,
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
    stakersSteth,
    stakersCbethConverted,
    groupedStakers,
    rEthRate,
    cbEthRate,
    chartDataBeaconStakesDaily,
    chartDataBeaconStakesCumulative,
  };
}
