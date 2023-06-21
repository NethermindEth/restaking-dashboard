"use client";

import { Inter } from "next/font/google";
import LineChart from "./charts/LineChart";
import PieChart from "./charts/PieChart";
import StackedBar from "./charts/StackedBar";
import LeaderBoard from "./leaderboard";
import { useState } from "react";
import { roundToDecimalPlaces } from "@/lib/utils";
import Disclaimer from "./Disclaimer";
import Image from "next/image";

export default function MainPage(params: any) {
  const [isMainnet, setIsMainnet] = useState(true);
  const [networkData, setNetworkData] = useState(
    params.data[isMainnet ? "mainnet" : "goerli"]
  );

  const handleSwitchBtn = () => {
    const network = !isMainnet;
    setIsMainnet(network);
    setNetworkData(params.data[network ? "mainnet" : "goerli"]);
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 md:p-24 font-semibold">
      <div className="flex self-end items-center">
        <span className="mr-2">Mainnet</span>
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="hidden"
              checked={isMainnet}
              onChange={handleSwitchBtn}
            />
            <div
              className={`toggle-path ${
                isMainnet ? "toggle-btn-mainnet" : "toggle-btn-goerli"
              } w-12 h-6 rounded-full shadow-inner`}
            ></div>
            <div
              className={`toggle-circle absolute bg-white w-6 h-6 rounded-full shadow inset-y-0 left-0 transform transition-transform duration-200 ${
                isMainnet ? "translate-x-0" : "translate-x-full"
              }`}
            ></div>
          </div>
        </label>
        <span className="ml-2">Testnet</span>
      </div>
      <div className="z-10 max-w-5xl items-center justify-between font-mono text-sm">
        <div className="h-48 flex w-full items-center justify-center lg:static lg:h-auto lg:w-auto lg:bg-none lgmb-12">
          <Image
            src={"/logo.png"}
            alt="EigenLayer Logo"
            width={64}
            height={72}
          />
          <p className="text-lg md:text-2xl ml-4">
            EigenLayer Stats on {isMainnet ? "Mainnet" : "Testnet"}
          </p>
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
            {roundToDecimalPlaces(
              networkData.totalstEthDeposits - networkData.totalstEthWithdrawals
            )}
          </p>
        </div>
        <div className="data-card data-card-reth grow mt-8 lg:mt-0 py-8 px-10 md:px-24 mx-4 shadow-lg rounded-md text-center">
          <span className="inline-block ">
            <Image src={"/reth.webp"} alt="rETH" width={48} height={48} />
          </span>
          <p className="text-sm md:text-base">Staked rETH</p>
          <p className="md:text-xl">
            {roundToDecimalPlaces(
              networkData.totalrEthDeposits - networkData.totalrEthWithdrawals
            )}
          </p>
        </div>
        {isMainnet && (
          <div className="data-card data-card-cbeth grow mt-8 lg:mt-0 py-8 px-10 md:px-24 mx-4 shadow-lg rounded-md text-center">
            <span className="inline-block ">
              <Image src={"/cbeth.png"} alt="cbETH" width={48} height={48} />
            </span>
            <p className="text-sm md:text-base">Staked cbETH</p>
            <p className="md:text-xl">
              {roundToDecimalPlaces(
                networkData.totalcbEthDeposits -
                  networkData.totalcbEthWithdrawals
              )}
            </p>
          </div>
        )}

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
            {roundToDecimalPlaces(networkData.totalBeaconChainStakes)}
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
                amounts: networkData.chartDataDepositsCumulative.amounts,
                timestamps: networkData.chartDataDepositsCumulative.timestamps,
                namedLabels: isMainnet
                  ? ["stETH", "rETH", "cbETH"]
                  : ["stETH", "rETH"],
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
                namedLabels: isMainnet
                  ? ["stETH", "rETH", "cbETH"]
                  : ["stETH", "rETH"],
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
                namedLabels: isMainnet
                  ? ["stETH", "rETH", "cbETH"]
                  : ["stETH", "rETH"],
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
                namedLabels: isMainnet
                  ? ["stETH", "rETH", "cbETH"]
                  : ["stETH", "rETH"],
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
              amounts: isMainnet
                ? [
                    networkData.totalstEthDeposits -
                      networkData.totalstEthWithdrawals,
                    (networkData.totalrEthDeposits -
                      networkData.totalrEthWithdrawals) *
                      networkData.rEthRate,
                    (networkData.totalcbEthDeposits -
                      networkData.totalcbEthWithdrawals) *
                      networkData.cbEthRate,
                    networkData.totalBeaconChainStakes,
                  ]
                : [
                    networkData.totalstEthDeposits -
                      networkData.totalstEthWithdrawals,
                    (networkData.totalrEthDeposits -
                      networkData.totalrEthWithdrawals) *
                      networkData.rEthRate,
                    networkData.totalBeaconChainStakes,
                  ],
              labels: isMainnet
                ? [
                    "stETH",
                    "rETH (as ETH)",
                    "cbETH (as ETH)",
                    "Beacon Chain ETH",
                  ]
                : ["stETH", "rETH (as ETH)", "Beacon Chain ETH"],
            }}
          />
        </div>

        <LeaderBoard
          isMainnet={isMainnet}
          boardData={{
            ethStakers: networkData.groupedStakers,
            stethStakers: networkData.stakersSteth,
            rethStakers: networkData.stakersRethConverted,
            cbethStakers: networkData.stakersCbethConverted,
            beaconchainethStakers: networkData.stakersBeaconChainEth,
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
