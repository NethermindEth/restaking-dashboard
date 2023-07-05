"use client";
import { useMemo } from "react";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import { cloneDeep } from "lodash";

const tokenConfig: { [key: string]: any } = {
  stETH: {
    label: "stETH",
    fill: false,
    lineTension: 0.1,
    pointStyle: "rect",
    backgroundColor: "rgba(26, 12, 109, 0.6)",
    borderColor: "rgba(26, 12, 109, 1)",
    borderDash: [],
    borderDashOffset: 0.0,
    pointBorderColor: "rgba(26, 12, 109, 1)",
    pointBackgroundColor: "#fff",
    pointBorderWidth: 1,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: "rgba(26, 12, 109, 0.6)",
    pointHoverBorderColor: "rgba(26, 12, 109, 1)",
    pointHoverBorderWidth: 2,
    pointRadius: 1,
    pointHitRadius: 10,
    data: [],
  },
  rETH: {
    label: "rETH",
    fill: false,
    lineTension: 0.1,
    pointStyle: "rect",
    backgroundColor: "rgba(255, 184, 0, 0.6)",
    borderColor: "rgb(255, 184, 0)",
    borderDash: [],
    borderDashOffset: 0.0,
    pointBorderColor: "rgba(255, 184, 0, 1)",
    pointBackgroundColor: "#fff",
    pointBorderWidth: 1,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: "rgba(255, 184, 0, 0.6)",
    pointHoverBorderColor: "rgba(255, 184, 0, 1)",
    pointHoverBorderWidth: 2,
    pointRadius: 1,
    pointHitRadius: 10,
    data: [],
  },
  cbETH: {
    label: "cbETH",
    fill: false,
    lineTension: 0.1,
    backgroundColor: "rgba(0, 153, 153, 0.6)",
    borderColor: "rgba(0, 153, 153, 1)",
    pointStyle: "rect",
    borderDash: [],
    borderDashOffset: 0.0,
    pointBorderColor: "rgba(0, 153, 153, 1)",
    pointBackgroundColor: "#fff",
    pointBorderWidth: 1,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: "rgba(0, 153, 153, 1)",
    pointHoverBorderColor: "rgba(0, 153, 153, 1)",
    pointHoverBorderWidth: 2,
    pointRadius: 1,
    pointHitRadius: 10,
    data: [],
  },
  ETH: {
    label: "Stacked ETH",
    fill: false,
    lineTension: 0.1,
    backgroundColor: "rgba(254, 156, 147, 0.6)",
    borderColor: "rgba(254, 156, 147, 1)",
    pointStyle: "rect",
    borderDash: [],
    borderDashOffset: 0.0,
    pointBorderColor: "rgba(254, 156, 147, 1)",
    pointBackgroundColor: "#fff",
    pointBorderWidth: 1,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: "rgba(254, 156, 147, 1)",
    pointHoverBorderColor: "rgba(254, 156, 147, 1)",
    pointHoverBorderWidth: 2,
    pointRadius: 1,
    pointHitRadius: 10,
    data: [],
  },
};

const LineChart = (params: {
  data: {
    title: string;
    namedLabels: string[];
    amounts: Number[][];
    timestamps: string[];
  };
}) => {
  const chartData = useMemo(() => {
    const internalConfig = cloneDeep(tokenConfig);
    const datasets = params.data.namedLabels.map(
      (token: string, index: number) => {
        const config = internalConfig[token];
        config.label = token;
        config.data = params.data.amounts[index];
        return config;
      }
    );

    return {
      labels: params.data.timestamps,
      datasets,
    };
  }, [params]);

  return (
    <Line
      data={chartData}
      title={params.data.title}
      options={{
        maintainAspectRatio: true,
        responsive: true,
        normalized: true,
        color: "rgb(26, 12, 109)",
      }}
    />
  );
};

export default LineChart;
