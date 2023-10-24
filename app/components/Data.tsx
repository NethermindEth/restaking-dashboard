"use client";

import { useState } from "react";
import Image from "next/image";
import LineChart from "./charts/LineChart";
import PieChart from "./charts/PieChart";
import StackedBar from "./charts/StackedBar";
import Leaderboard from "./Leaderboard";
import Loader from "./Loader";
import Error from "./Error";

import { SupportedNetwork, SupportedToken } from "../utils";
import { getNetworkTokens } from "../constants";
import { useDeposits } from "./hooks/useDeposits";
import { useLeaderboard } from "./hooks/useLeaderboard";
import { useWithdrawals } from "./hooks/useWithdrawals";
import { useTotalStakedEth } from "./hooks/useTotalStakedEth";
import { useTotalStakedTokens } from "./hooks/useTotalStakedTokens";

export default function Data() {
  const [network, setNetwork] = useState<SupportedNetwork>("eth");
  
  const { data: depositsData, error: depositsError, isLoading: depositsLoading } = useDeposits(network);
  const { data: withdrawalsData, error: withdrawalsError, isLoading: withdrawalsLoading } = useWithdrawals(network);
  const { data: leaderboardData, error: leaderboardError, isLoading: leaderboardLoading } = useLeaderboard(network);
  const { data: totalStakedEthData, error: totalStakedEthError, isLoading: totalStakedEthLoading } = useTotalStakedEth(network);
  const { data: totalStakedTokensData, error: totalStakedTokensError, isLoading: totalStakedTokensLoading } = useTotalStakedTokens(network);

  const error = [depositsError, withdrawalsError, leaderboardError, totalStakedEthError, totalStakedTokensError].some(el => el);
  const loading = [depositsLoading, withdrawalsLoading, leaderboardLoading, totalStakedEthLoading, totalStakedTokensLoading].some(el => el);

  const networkTokenData = getNetworkTokens(network);
  const networkTokens = Object.keys(networkTokenData) as SupportedToken[];
  const networkStrategyTokens = networkTokens.filter(el => el !== "beacon") as Exclude<SupportedToken, "beacon">[];

  if (error) {
    return <Error message="Something went wrong! Try reloading the page." />;
  }

  if (
    loading
    || depositsData == null
    || withdrawalsData == null
    || leaderboardData == null
    || totalStakedEthData == null
    || totalStakedTokensData == null
  ) {
    return <Loader />;
  }

  return (
    <>
      <div className="h-48 flex w-full items-center justify-center lg:static lg:h-auto lg:w-auto lg:bg-none lgmb-12">
        <h2>Select Network:</h2>
        <div className="form-group">
          <select
            className="form-control"
            value={network}
            onChange={(e) => {
              setNetwork(e.target.value as SupportedNetwork);
            }}
          >
            <option value="eth">ETH</option>
            <option value="goerli">GOERLI</option>
          </select>
        </div>
      </div>
      <div className="my-8 w-full lg:w-1/2 flex flex-wrap flex-col lg:flex-row lg:flex-nowrap items-stretch justify-center">
        {Object.entries(networkTokenData).map(([key, value]) => (
          <div
            key={key}
            className={`data-card ${value.color} grow mt-8 lg:mt-0 py-8 px-10 md:px-24 mx-4 shadow-lg rounded-md text-center`}
          >
            <span className="inline-block">
              <Image src={value.image} alt={key} width={48} height={48} />
            </span>
            <p className="text-sm md:text-base">Staked {value.label}</p>
            <p className="md:text-xl">
              {totalStakedTokensData[key as SupportedToken]?.toFixed(2)}
            </p>
          </div>
        ))}
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
                amounts: networkStrategyTokens.map((token) => depositsData.deposits[token as SupportedToken]?.map(el => el.cumulativeAmount.toFixed(2))),
                timestamps: depositsData.timestamps,
                namedLabels: networkStrategyTokens,
              }}
            />
          </div>
        </div>
        <div className="charts-homepage mt-16">
          <h3 className="text-center text-xl">Deposited tokens by day</h3>
          <div className="chart-staked-lst-date">
            <StackedBar
              data={{
                amounts: networkStrategyTokens.map((token) => depositsData.deposits[token as SupportedToken]?.map(el => el.totalAmount.toFixed(2))),
                timestamps: depositsData.timestamps,
                namedLabels: networkStrategyTokens,
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
                amounts: networkStrategyTokens.map((token) => withdrawalsData.withdrawals[token as SupportedToken]?.map(el => el.cumulativeAmount.toFixed(2))),
                timestamps: withdrawalsData.timestamps,
                namedLabels: networkStrategyTokens,
              }}
            />
          </div>
        </div>

        <div className="charts-homepage mt-16">
          <h3 className="text-center text-xl">Token Withdrawals by day</h3>
          <div className="chart-staked-lst-date">
            <StackedBar
              data={{
                amounts: networkStrategyTokens.map((token) => withdrawalsData.withdrawals[token as SupportedToken]?.map(el => el.totalAmount.toFixed(2))),
                timestamps: withdrawalsData.timestamps,
                namedLabels: networkStrategyTokens,
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
                amounts: [depositsData.deposits.beacon?.map(el => el.cumulativeAmount.toFixed(2))],
                timestamps: depositsData.timestamps,
                namedLabels: ["beacon"],
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
                title: "Cumulative Token Withdrawals by day",
                amounts: [depositsData.deposits.beacon?.map(el => el.totalAmount.toFixed(2))],
                timestamps: depositsData.timestamps,
                namedLabels: ["beacon"],
              }}
              title="Token Withdrawals by day"
            />
          </div>
        </div>

        <div className="charts-homepage pie-chart-deposits w-full md:w-1/3 mx-auto mt-16">
          <h3 className="text-center text-xl">Staked ETH Distribution</h3>
          <PieChart
            data={{
              amounts: networkTokens.map(token => totalStakedEthData[token]?.toFixed(2)),
              labels: networkTokens.map(token => networkTokenData[token]?.label),
            }}
          />
        </div>

        <Leaderboard
          boardData={{
            network: networkTokenData,
            ethStakers: leaderboardData.total,
            stethStakers: leaderboardData.partial.stEth,
            rethStakers: leaderboardData.partial.rEth,
            cbethStakers: leaderboardData.partial.cbEth,
            beaconStakers: leaderboardData.partial.beacon,
          }}
          title="Restaking Leaderboard"
        />
      </div>
    </>
  );
}
