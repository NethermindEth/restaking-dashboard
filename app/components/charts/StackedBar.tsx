"use client";
import "chart.js/auto";
import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { cloneDeep } from "lodash";

const tokenConfig: { [key: string]: any } = {
  stETH: {
    label: "stETH",
    data: [],
    backgroundColor: ["rgba(26, 12, 109, 0.6)"],
    borderColor: ["rgba(26, 12, 109, 1)"],
    borderWidth: 1,
  },
  rETH: {
    label: "rETH",
    data: [],
    backgroundColor: ["rgba(255, 184, 0, 0.6)"],
    borderColor: ["rgba(255, 184, 0, 1)"],
    borderWidth: 1,
  },
  cbETH: {
    label: "cbETH",
    data: [],
    backgroundColor: ["rgba(0, 153, 153, 0.6)"],
    borderColor: ["rgba(0, 153, 153, 1)"],
    borderWidth: 1,
  },
  ETH: {
    label: "Beacon Chain Eth",
    data: [],
    backgroundColor: "rgba(254, 156, 147, 0.6)",
    borderColor: ["rgba(254, 156, 147, 1)"],
    borderWidth: 1,
  },
};

export default (params: {
  data: { namedLabels: string[]; labels: string[]; amounts: Number[][] };
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
      labels: params.data.labels,
      datasets,
    };
  }, [params]);

  return (
    <Bar
      data={chartData}
      options={{
        maintainAspectRatio: true,
        responsive: true,
        normalized: true,
        scales: {
          x: { stacked: true, min: 0, max: 30 },
          y: { stacked: true },
        },
        color: "rgb(26, 12, 109)",
      }}
    />
  );
};
