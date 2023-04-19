"use client";
import { useMemo } from "react";
import { Bar } from "react-chartjs-2";

const dataConfig = {
  labels: [],

  datasets: [
    {
      label: "Stacked ETH",
      data: [],
      backgroundColor: "rgba(255, 99, 132, 0.2)",

      borderColor: ["rgba(255, 99, 132, 1)"],
      borderWidth: 1,
    },
    {
      label: "Stacked StEth",
      data: [],
      backgroundColor: ["rgba(75, 192, 192, 0.2)"],
      borderColor: ["rgba(75, 192, 192, 1)"],
      borderWidth: 1,
    },
    {
      label: "Stacked REth",
      data: [],
      backgroundColor: ["rgba(255, 206, 86, 0.2)"],
      borderColor: ["rgba(255, 206, 86, 1)"],
      borderWidth: 1,
    },
  ],
};

export default (data: any) => {
  const chartData = useMemo(() => {
    const internalChartData = dataConfig;

    internalChartData.labels = data.data.labels;
    internalChartData.datasets.forEach((dataset, index) => {
      dataset.data = data.data.amounts[index];
    });

    return internalChartData;
  }, [data]);

  return (
    <Bar
      data={chartData}
      options={{
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true, min: 0, max: 7 },
          y: { stacked: true },
        },
      }}
    />
  );
};
