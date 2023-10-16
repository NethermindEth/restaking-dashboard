"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import LineChart from "./charts/LineChart";
import PieChart from "./charts/PieChart";
import StackedBar from "./charts/StackedBar";
import LeaderBoard from "./leaderboard";
import Disclaimer from "./Disclaimer";
import Loader from "./Loader";
import Error from "./Error";
import { getDashboardData } from "../utils";
import { roundToDecimalPlaces } from "@/lib/utils";

export default function Data() {
  const [network, updateNetwork] = useState("eth");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setDashboardData(null);

    async function fetchData() {
      try {
        const data = await getDashboardData(network);
        setDashboardData(data);
      } catch (error) {
        setError("Something went wrong! Try reloading the page");
      }
    }

    fetchData();
  }, [network]);

  return (
    <>
      {!!error && <Error message={error} />}
      {!dashboardData ? (
        <Loader />
      ) : (
        <>
          <div className="h-48 flex w-full items-center justify-center lg:static lg:h-auto lg:w-auto lg:bg-none lgmb-12">
            <h2>Select Network:</h2>
            <div className="form-group">
              <select
                className="form-control"
                value={network}
                onChange={(e) => {
                  updateNetwork(e.target.value);
                }}
              >
                <option value="eth">ETH</option>
                <option value="goerli">Goerli</option>
              </select>
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
                {roundToDecimalPlaces(dashboardData.stEthTvl)}
              </p>
            </div>
            <div className="data-card data-card-reth grow mt-8 lg:mt-0 py-8 px-10 md:px-24 mx-4 shadow-lg rounded-md text-center">
              <span className="inline-block ">
                <Image src={"/reth.webp"} alt="rETH" width={48} height={48} />
              </span>
              <p className="text-sm md:text-base">Staked rETH</p>
              <p className="md:text-xl">
                {roundToDecimalPlaces(dashboardData.rEthTvl)}
              </p>
            </div>
            <div className="data-card data-card-cbeth grow mt-8 lg:mt-0 py-8 px-10 md:px-24 mx-4 shadow-lg rounded-md text-center">
              <span className="inline-block ">
                <Image src={"/cbeth.png"} alt="cbETH" width={48} height={48} />
              </span>
              <p className="text-sm md:text-base">Staked cbETH</p>
              <p className="md:text-xl">
                {roundToDecimalPlaces(dashboardData.cbEthTvl)}
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
                {roundToDecimalPlaces(dashboardData.totalStakedBeaconChainEth)}
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
                    amounts: dashboardData.chartDataDepositsCumulative.amounts,
                    timestamps:
                      dashboardData.chartDataDepositsCumulative.timestamps,
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
                    amounts: dashboardData.chartDataDepositsDaily.amounts,
                    labels: dashboardData.chartDataDepositsDaily.timestamps,
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
                    amounts:
                      dashboardData.chartDataWithdrawalsCumulative.amounts,
                    timestamps:
                      dashboardData.chartDataWithdrawalsCumulative.timestamps,
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
                    amounts: dashboardData.chartDataWithdrawalsDaily.amounts,
                    labels: dashboardData.chartDataWithdrawalsDaily.timestamps,
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
                    amounts:
                      dashboardData.chartDataBeaconStakesCumulative.amounts,
                    timestamps:
                      dashboardData.chartDataBeaconStakesCumulative.timestamps,
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
                    amounts: dashboardData.chartDataBeaconStakesDaily.amounts,
                    labels: dashboardData.chartDataBeaconStakesDaily.timestamps,
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
                    dashboardData.stEthTvl,
                    dashboardData.rEthTvl * dashboardData.rEthRate,
                    dashboardData.cbEthTvl * dashboardData.cbEthRate,
                    dashboardData.totalStakedBeaconChainEth,
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
                ethStakers: dashboardData.groupedStakers,
                stethStakers: dashboardData.stakersStEthConverted,
                rethStakers: dashboardData.stakersREthConverted,
                cbethStakers: dashboardData.stakersCbEthConverted,
                beaconchainethStakers:
                  dashboardData.stakersBeaconChainEthConverted,
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
        </>
      )}
    </>
  );
}
