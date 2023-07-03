"use client";

import { ethers } from "ethers";
import { Inter } from "next/font/google";
import LineChart from "./charts/LineChart";
import PieChart from "./charts/PieChart";
import StackedBar from "./charts/StackedBar";
import LeaderBoard from "./leaderboard";

const inter = Inter({ subsets: ["latin"] });

import {
  LeaderboardUserData,
  extractAmountsAndTimestamps,
  roundToDecimalPlaces,
} from "@/lib/utils";
import Image from "next/image";
import Disclaimer from "./Disclaimer";
import { useState } from "react";

export default function Dashboard(data: any) {
  const [isMainnet, setIsMainnet] = useState(true);
  const [networkData, setNetworkData] = useState(data.data.mainnet);

  function switchNetwork(isMainnet: boolean) {
    setIsMainnet(isMainnet);
    setNetworkData(isMainnet ? data.data.mainnet : data.data.goerli);
  }

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
          <p className="md:text-xl">
            {roundToDecimalPlaces(networkData.stEthTvl)}
          </p>
        </div>
        <div className="data-card data-card-reth grow mt-8 lg:mt-0 py-8 px-10 md:px-24 mx-4 shadow-lg rounded-md text-center">
          <span className="inline-block ">
            <Image src={"/reth.webp"} alt="rETH" width={48} height={48} />
          </span>
          <p className="text-sm md:text-base">Staked rETH</p>
          <p className="md:text-xl">
            {roundToDecimalPlaces(networkData.rEthTvl)}
          </p>
        </div>
        <div className="data-card data-card-cbeth grow mt-8 lg:mt-0 py-8 px-10 md:px-24 mx-4 shadow-lg rounded-md text-center">
          <span className="inline-block ">
            <Image src={"/cbeth.png"} alt="cbETH" width={48} height={48} />
          </span>
          <p className="text-sm md:text-base">Staked cbETH</p>
          <p className="md:text-xl">
            {roundToDecimalPlaces(networkData.cbEthTvl)}
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
            {roundToDecimalPlaces(networkData.totalStakedBeaconChainEth)}
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
                amounts: networkData.chartDataDepositsCumulative.amounts,
                timestamps: networkData.chartDataDepositsCumulative.timestamps,
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
                amounts: networkData.chartDataDepositsDaily.amounts,
                labels: networkData.chartDataDepositsDaily.timestamps,
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
                amounts: networkData.chartDataWithdrawalsCumulative.amounts,
                timestamps:
                  networkData.chartDataWithdrawalsCumulative.timestamps,
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
                amounts: networkData.chartDataWithdrawalsDaily.amounts,
                labels: networkData.chartDataWithdrawalsDaily.timestamps,
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
                amounts: networkData.chartDataBeaconStakesCumulative.amounts,
                timestamps:
                  networkData.chartDataBeaconStakesCumulative.timestamps,
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
                amounts: networkData.chartDataBeaconStakesDaily.amounts,
                labels: networkData.chartDataBeaconStakesDaily.timestamps,
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
                networkData.stEthTvl,
                networkData.rEthTvl * networkData.rEthRate,
                networkData.cbEthTvl * networkData.cbEthRate,
                networkData.totalStakedBeaconChainEth,
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
            ethStakers: networkData.groupedStakers,
            stethStakers: networkData.stakersStEthConverted,
            rethStakers: networkData.stakersREthConverted,
            cbethStakers: networkData.stakersCbEthConverted,
            beaconchainethStakers: networkData.stakersBeaconChainEthConverted,
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
