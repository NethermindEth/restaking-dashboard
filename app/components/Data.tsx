"use client";

import { useState } from "react";
import Image from "next/image";

import { SupportedNetwork } from "@/app/utils/types";
import { getNetworkTokens, getTokenInfo } from "@/app/utils/constants";
import { useTotalStakedTokens } from "@/app/components/hooks/useTotalStakedTokens";
import StrategyDepositsChart from "@/app/components/charts/CumulativeStrategyDepositsChart";
import CumulativeStrategyDepositsChart from "@/app/components/charts/CumulativeStrategyDepositsChart";
import CumulativeStrategyWithdrawalsChart from "@/app/components/charts/CumulativeStrategyWithdrawalsChart";
import StrategyWithdrawalsChart from "@/app/components/charts/StrategyWithdrawalsChart";
import CumulativeBeaconDepositsChart from "@/app/components/charts/CumulativeBeaconDepositsChart";
import BeaconDepositsChart from "@/app/components/charts/BeaconDepositsChart";
import DistributionChart from "@/app/components/charts/DistributionChart";
import Leaderboard from "@/app/components/Leaderboard";

export default function Data() {
  const [network, setNetwork] = useState<SupportedNetwork>("eth");

  const { data: totalStakedTokensData } = useTotalStakedTokens(network);
  const tokens = getNetworkTokens(network);

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
        {tokens.map(token => (
          <div
            key={token}
            className={`data-card ${getTokenInfo(token).color} ${(!totalStakedTokensData)? "loading-pulse" : ""} grow mt-8 lg:mt-0 py-8 px-10 md:px-24 mx-4 shadow-lg rounded-md text-center`}
          >
            <span className="inline-block">
              <Image src={getTokenInfo(token).image} alt={getTokenInfo(token).label} width={48} height={48} />
            </span>
            <p className="text-sm md:text-base">Staked {getTokenInfo(token).label}</p>
            <p className="md:text-xl">
              {totalStakedTokensData && totalStakedTokensData[token]?.toFixed(2)}
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
            <CumulativeStrategyDepositsChart network={network} />
          </div>
        </div>
        <div className="charts-homepage mt-16">
          <h3 className="text-center text-xl">Deposited tokens by day</h3>
          <div className="chart-staked-lst-date">
            <StrategyDepositsChart network={network} />
          </div>
        </div>

        <div className="charts-homepage mt-16">
          <h3 className="text-center text-xl">
            Cumulative Token Withdrawals by day
          </h3>
          <div className="chart-2">
            <CumulativeStrategyWithdrawalsChart network={network} />
          </div>
        </div>

        <div className="charts-homepage mt-16">
          <h3 className="text-center text-xl">Token Withdrawals by day</h3>
          <div className="chart-staked-lst-date">
            <StrategyWithdrawalsChart network={network} />
          </div>
        </div>

        <div className="charts-homepage mt-16">
          <h3 className="text-center text-xl">
            Cumulative Beacon Chain ETH in EigenPods by day
          </h3>
          <div className="chart-2">
            <CumulativeBeaconDepositsChart network={network} />
          </div>
        </div>

        <div className="charts-homepage mt-16">
          <h3 className="text-center text-xl">
            Added Beacon Chain ETH to EigenPods by day
          </h3>
          <div className="chart-staked-lst-date">
            <BeaconDepositsChart network={network} />
          </div>
        </div>

        <div className="charts-homepage pie-chart-deposits w-full md:w-1/3 mx-auto mt-16">
          <h3 className="text-center text-xl">Staked ETH Distribution</h3>
          <DistributionChart network={network} />
        </div>

        <Leaderboard network={network} />
      </div>
    </>
  );
}
