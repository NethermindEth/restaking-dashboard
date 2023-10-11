import {
  CBETH_ADDRESS,
  CBETH_STRATEGY_ADDRESS,
  MAX_LEADERBOARD_SIZE,
  RETH_ADDRESS,
  RETH_STRATEGY_ADDRESS,
  STETH_STRATEGY_ADDRESS,
  provider,
} from "./constants";
import {
  RocketTokenRETH__factory,
  StakedTokenV1__factory,
  StrategyBaseTVLLimits__factory,
} from "@/typechain";
import {
  LeaderboardUserData,
  Deposits,
  Withdrawls,
  extractAmountsAndTimestamps,
  DepositStakersData,
} from "@/lib/utils";
import axios from "axios";

export async function getDashboardData() {
  const {
    depositData,
    withdrawData,
    totalStakedBeaconChainEth,
    stakersBeaconChainEth,
    depositDataStakers,
  } = await fetchData();

  const {
    chartDataDepositsDaily,
    chartDataDepositsCumulative,
    chartDataBeaconStakesDaily,
    chartDataBeaconStakesCumulative,
    chartDataWithdrawalsDaily,
    chartDataWithdrawalsCumulative,
    stakersStEth,
    stakersCbEth,
    stakersREth,
  } = generateChartData(depositData, withdrawData, depositDataStakers);

  const {
    stEthSharesRate,
    rEthSharesRate,
    cbEthSharesRate,
    cbEthRate,
    rEthRate,
    stEthTvl,
    rEthTvl,
    cbEthTvl,
  } = await getRates();

  const stakersBeaconChainEthConverted: LeaderboardUserData[] =
    // @ts-ignore
    stakersBeaconChainEth.map((d) => {
      return {
        depositor: d.pod_owner,
        totalStaked: parseInt(d.total_effective_balance),
      };
    });

  const stakersREthConverted: LeaderboardUserData[] = stakersREth.map((d) => ({
    depositor: d.depositor!,
    totalStaked: d.totalStaked! * rEthSharesRate * rEthRate,
  }));

  const stakersStEthConverted: LeaderboardUserData[] = stakersStEth.map(
    (d) => ({
      depositor: d.depositor!,
      totalStaked: d.totalStaked! * stEthSharesRate,
    })
  );

  const stakersCbEthConverted: LeaderboardUserData[] = stakersCbEth.map(
    (d) => ({
      depositor: d.depositor!,
      totalStaked: d.totalStaked! * cbEthSharesRate * cbEthRate,
    })
  );

  const groupedStakers = [
    ...stakersBeaconChainEthConverted,
    ...stakersStEthConverted,
    ...stakersREthConverted,
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

  return {
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
    stakersStEthConverted,
    stakersCbEthConverted,
    groupedStakers,
    rEthRate,
    cbEthRate,
    chartDataBeaconStakesDaily,
    chartDataBeaconStakesCumulative,
  };
}

async function fetchData() {
  const depositDataPromise = axios.get<Deposits>(
    `${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/deposits`
  );

  const withdrawDataPromise = axios.get<Withdrawls>(
    `${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/withdrawls`
  );

  const depositDataStakersPromise = axios.get<DepositStakersData>(
    `${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/getStrategyDepositLeaderBoard`
  );

  const totalStakedBeaconChainEthPromise = axios.get(
    `${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/totalStakedBeconChainEth`
  );

  const stakersBeaconChainEthPromise = axios.get(
    `${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/stakersBeaconChainEth`
  );

  const [
    depositDataResponse,
    withdrawDataResponse,
    totalStakedBeaconResponse,
    stakersBeaconChainEthResponse,
    depositDataStakersResponse,
  ] = await Promise.all([
    depositDataPromise,
    withdrawDataPromise,
    totalStakedBeaconChainEthPromise,
    stakersBeaconChainEthPromise,
    depositDataStakersPromise,
  ]);

  const depositData = depositDataResponse.data;
  const withdrawData = withdrawDataResponse.data;

  const totalStakedBeaconChainEth = JSON.parse(
    totalStakedBeaconResponse.data
  )[0].final_balance;

  const stakersBeaconChainEth = stakersBeaconChainEthResponse.data;
  const depositDataStakers = depositDataStakersResponse.data;

  return {
    depositData,
    withdrawData,
    totalStakedBeaconChainEth,
    stakersBeaconChainEth,
    depositDataStakers,
  };
}

function generateChartData(
  depositData: Deposits,
  withdrawData: Withdrawls,
  depositDataStakers: DepositStakersData
) {
  const chartDataDepositsDaily = extractAmountsAndTimestamps(
    false,
    depositData.stEthDeposits,
    depositData.rEthDeposits,
    depositData.cbEthDeposits
  );

  const chartDataDepositsCumulative = extractAmountsAndTimestamps(
    true,
    depositData.stEthDeposits,
    depositData.rEthDeposits,
    depositData.cbEthDeposits
  );

  // all bool values herafter are for test purpose only for now
  const chartDataBeaconStakesDaily = extractAmountsAndTimestamps(
    false,
    depositData.beaconChainDeposits
  );

  const chartDataBeaconStakesCumulative = extractAmountsAndTimestamps(
    true,
    depositData.beaconChainDeposits
  );

  const chartDataWithdrawalsDaily = extractAmountsAndTimestamps(
    false,
    withdrawData.stEthWithdrawls,
    withdrawData.rEthWithdrawls,
    withdrawData.cbEthWithdrawls
  );

  const chartDataWithdrawalsCumulative = extractAmountsAndTimestamps(
    true,
    withdrawData.stEthWithdrawls,
    withdrawData.rEthWithdrawls,
    withdrawData.cbEthWithdrawls
  );

  const stakersStEth = depositDataStakers.stEthDeposits || [];

  const stakersCbEth = depositDataStakers.cbEthDeposits || [];

  const stakersREth = depositDataStakers.rEthDeposits || [];

  return {
    chartDataDepositsDaily,
    chartDataDepositsCumulative,
    chartDataBeaconStakesDaily,
    chartDataBeaconStakesCumulative,
    chartDataWithdrawalsDaily,
    chartDataWithdrawalsCumulative,
    stakersStEth,
    stakersCbEth,
    stakersREth,
  };
}

async function getRates() {
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

  const rEthSharesRate =
    Number(await rEthStrategy.sharesToUnderlyingView(BigInt(1e18))) / 1e18;
  const stEthSharesRate =
    Number(await stEthStrategy.sharesToUnderlyingView(BigInt(1e18))) / 1e18;
  const cbEthSharesRate =
    Number(await cbEthStrategy.sharesToUnderlyingView(BigInt(1e18))) / 1e18;

  return {
    rEthSharesRate,
    stEthSharesRate,
    cbEthSharesRate,
    rEthRate,
    cbEthRate,
    stEthTvl,
    rEthTvl,
    cbEthTvl,
  };
}
