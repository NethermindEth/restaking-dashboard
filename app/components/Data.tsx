"use client";

import { useState } from "react";
import Image from "next/image";

import { SupportedNetwork } from "@/app/utils/types";
import { DEFAULT_TIMELINE, DEFAULT_TIME_RANGE, getNetworkTokens, getTokenInfo } from "@/app/utils/constants";
import { useTotalStakedTokens } from "@/app/components/hooks/useTotalStakedTokens";
import CumulativeStrategyDepositsChart from "@/app/components/charts/CumulativeStrategyDepositsChart";
import StrategyDepositsChart from "@/app/components/charts/StrategyDepositsChart";
import CumulativeStrategyWithdrawalsChart from "@/app/components/charts/CumulativeStrategyWithdrawalsChart";
import StrategyWithdrawalsChart from "@/app/components/charts/StrategyWithdrawalsChart";
import CumulativeBeaconDepositsChart from "@/app/components/charts/CumulativeBeaconDepositsChart";
import BeaconDepositsChart from "@/app/components/charts/BeaconDepositsChart";
import DistributionChart from "@/app/components/charts/DistributionChart";
import Leaderboard from "@/app/components/Leaderboard";
import TimelineSelector from "@/app/components/TimelineSelector";

export default function Data() {
  const [network, setNetwork] = useState<SupportedNetwork>("eth");
  const [timeline, setTimeline] = useState<any>({});

  const handleTimelineChange = (name: string, values: Object) => {
    setTimeline((prevValues: any) => ({
      ...prevValues,
      [name]: values,
    }));
  };

  const { data: totalStakedTokensData } = useTotalStakedTokens(network);
  const tokens = getNetworkTokens(network);

  return (
    <>
      <div className="h-48 flex w-full items-center justify-center lg:static lg:h-auto lg:w-auto lg:bg-none lgmb-12">
        <h2 className="mr-2">Select Network:</h2>
        <div className="form-group">
          <select
            className="form-control"
            value={network}
            onChange={(e) => {
              setNetwork(e.target.value as SupportedNetwork);
            }}
          >
            <option value="eth">Mainnet</option>
            <option value="goerli">Goerli</option>
          </select>
        </div>
      </div>
      <div className={`my-8 w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4`}>
        {tokens.map(token => (
          <div
            key={token}
            className={`data-card ${(!totalStakedTokensData)? "loading-pulse" : ""} grow lg:mt-0 min-w-100 rounded-md text-center`}
          >
            <span className="inline-block">
              <Image src={getTokenInfo(token).image} alt={getTokenInfo(token).label} width={48} height={48} />
            </span>
            <p className="text-sm md:text-base">{getTokenInfo(token).label}</p>
            <p className="md:text-xl">
              {totalStakedTokensData && totalStakedTokensData[token]?.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="staking-dashboard w-full md:w-3/4 lg:w-2/3 2xl:w-1/2">
        <div className="charts-homepage mt-16">
          <h3 className="text-center text-xl">Cumulative deposited tokens</h3>
          <div className="chart-2">
            <CumulativeStrategyDepositsChart network={network} timeRange={timeline["deposit"]?.timeRange ?? DEFAULT_TIME_RANGE} timeline={timeline["deposit"]?.timeline ?? DEFAULT_TIMELINE} />
          </div>
          <TimelineSelector name="deposit" onTimelineChange={handleTimelineChange} />
        </div>
        <div className="charts-homepage mt-16">
          <h3 className="text-center text-xl">Deposited tokens</h3>
          <div className="chart-staked-lst-date">
            <StrategyDepositsChart network={network} timeRange={timeline["depositCumulative"]?.timeRange ?? DEFAULT_TIME_RANGE} timeline={timeline["depositCumulative"]?.timeline ?? DEFAULT_TIMELINE} />
          </div>
          <TimelineSelector name="depositCumulative" onTimelineChange={handleTimelineChange} />
        </div>

        <div className="charts-homepage mt-16">
          <h3 className="text-center text-xl">Cumulative Token Withdrawals</h3>
          <div className="chart-2">
            <CumulativeStrategyWithdrawalsChart network={network} timeRange={timeline["withdrawalCumulative"]?.timeRange ?? DEFAULT_TIME_RANGE} timeline={timeline["withdrawalCumulative"]?.timeline ?? DEFAULT_TIMELINE} />
          </div>
          <TimelineSelector name="withdrawalCumulative" onTimelineChange={handleTimelineChange} />
        </div>

        <div className="charts-homepage mt-16">
          <h3 className="text-center text-xl">Token Withdrawals</h3>
          <div className="chart-staked-lst-date">
            <StrategyWithdrawalsChart network={network} timeRange={timeline["withdrawal"]?.timeRange ?? DEFAULT_TIME_RANGE} timeline={timeline["withdrawal"]?.timeline ?? DEFAULT_TIMELINE} />
          </div>
          <TimelineSelector name="withdrawal" onTimelineChange={handleTimelineChange} />
        </div>

        <div className="charts-homepage mt-16">
          <h3 className="text-center text-xl">
            Cumulative Beacon Chain ETH in EigenPods
          </h3>
          <div className="chart-2">
            <CumulativeBeaconDepositsChart network={network} timeRange={timeline["beaconCumulative"]?.timeRange ?? DEFAULT_TIME_RANGE} timeline={timeline["beaconCumulative"]?.timeline ?? DEFAULT_TIMELINE} />
          </div>
          <TimelineSelector name="beaconCumulative" onTimelineChange={handleTimelineChange} />
        </div>

        <div className="charts-homepage mt-16">
          <h3 className="text-center text-xl">
            Beacon Chain ETH Added to EigenPods
          </h3>
          <div className="chart-staked-lst-date">
            <BeaconDepositsChart network={network} timeRange={timeline["beacon"]?.timeRange ?? DEFAULT_TIME_RANGE} timeline={timeline["beacon"]?.timeline ?? DEFAULT_TIMELINE} />
          </div>
          <TimelineSelector name="beacon" onTimelineChange={handleTimelineChange} />
        </div>

        <div className="charts-homepage pie-chart-deposits w-full md:w-1/2 mx-auto mt-16">
          <h3 className="text-center text-xl">Staked ETH Distribution</h3>
          <DistributionChart network={network} />
        </div>

        <Leaderboard network={network} />
      </div>
    </>
  );
}
