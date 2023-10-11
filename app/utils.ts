import { ethers } from "ethers";
import {
  RocketTokenRETH__factory,
  StakedTokenV1__factory,
  StrategyBaseTVLLimits__factory,
} from "@/typechain";
import {
  DailyTokenData,
  LeaderboardUserData,
  Deposits,
  Withdrawls,
  extractAmountsAndTimestamps,
} from "@/lib/utils";
import axios from "axios";

const RETH_ADDRESS = "0xae78736Cd615f374D3085123A210448E74Fc6393";
const CBETH_ADDRESS = "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704";
const STETH_STRATEGY_ADDRESS = "0x93c4b944D05dfe6df7645A86cd2206016c51564D";
const CBETH_STRATEGY_ADDRESS = "0x54945180dB7943c0ed0FEE7EdaB2Bd24620256bc";
const RETH_STRATEGY_ADDRESS = "0x1BeE69b7dFFfA4E2d53C2a2Df135C388AD25dCD2";
const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth");
const MAX_LEADERBOARD_SIZE = 50;
const MAX_CHART_SIZE = 30;

export async function getDashboardData() {
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

  const depositDataPromise = axios.get<Deposits>(
    `${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/deposits`
  );

  const withdrawDataPromise = axios.get<Withdrawls>(
    `${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/withdrawls`
  );

  const [depositDataResponse, withdrawDataResponse] = await Promise.all([
    depositDataPromise,
    withdrawDataPromise,
  ]);

  const depositData = depositDataResponse.data;

  const withdrawData = withdrawDataResponse.data;

  const totalStakedBeaconChainEth = JSON.parse(
    (
      await axios.get(
        `${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/totalStakedBeconChainEth`
      )
    ).data
  )[0].final_balance;

  const stakersBeaconChainEth = (
    await axios.get(
      `${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/stakersBeaconChainEth`
    )
  ).data;

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

  const depositDataStakers = (
    await axios.get<Deposits>(
      `${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/getStrategyDepositLeaderBoard`
    )
  ).data;

  const stakersStEth = depositDataStakers.stEthDeposits || [];

  const stakersCbEth = depositDataStakers.cbEthDeposits || [];

  const stakersREth = depositDataStakers.rEthDeposits || [];

  const rEthSharesRate =
    Number(await rEthStrategy.sharesToUnderlyingView(BigInt(1e18))) / 1e18;
  const stEthSharesRate =
    Number(await stEthStrategy.sharesToUnderlyingView(BigInt(1e18))) / 1e18;
  const cbEthSharesRate =
    Number(await cbEthStrategy.sharesToUnderlyingView(BigInt(1e18))) / 1e18;

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
