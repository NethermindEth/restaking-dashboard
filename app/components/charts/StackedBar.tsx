"use client";
import "chart.js/auto";
import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { cloneDeep } from "lodash";

const dataConfig = {
  labels: [],

  datasets: [
    {
      label: "stEth",
      data: [],
      backgroundColor: ["rgba(26, 12, 109, 0.6)"],
      borderColor: ["rgba(26, 12, 109, 1)"],
      borderWidth: 1,
    },
    {
      label: "rEth",
      data: [],
      backgroundColor: ["rgba(255, 184, 0, 0.6)"],
      borderColor: ["rgba(255, 184, 0, 1)"],
      borderWidth: 1,
    },
    {
      label: "Beacon Chain Eth",
      data: [],
      backgroundColor: "rgba(254, 156, 147, 0.6)",

      borderColor: ["rgba(254, 156, 147, 1)"],
      borderWidth: 1,
    },
  ],
};

export default (data: any) => {
  const chartData = useMemo(() => {
    const internalChartData = cloneDeep(dataConfig);
    // Todo: change dataset generation
    if (data.data.namedLabels.length === 1) {
      internalChartData.datasets.shift();
      internalChartData.datasets.shift();
    }
    if (data.data.namedLabels.length === 2) {
      internalChartData.datasets.pop();
    }

    internalChartData.labels = data.data.labels;
    internalChartData.datasets.forEach((dataset, index) => {
      dataset.data = data.data.amounts[index];
      dataset.label = data.data.namedLabels[index];
    });
    return internalChartData;
  }, [data]);

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
