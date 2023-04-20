"use client";
import { useMemo } from "react";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import { cloneDeep } from "lodash";

const dataConfig = {
  labels: [],
  datasets: [
    // {
    //   label: "Stacked ETH",
    //   fill: false,
    //   lineTension: 0.1,
    //   backgroundColor: "rgba(255, 99, 132,0.4)",
    //   borderColor: "rgba(255, 99, 132, 1)",
    //   pointStyle: "rect",
    //   borderDash: [],
    //   borderDashOffset: 0.0,
    //   pointBorderColor: "rgba(255, 99, 132,1)",
    //   pointBackgroundColor: "#fff",
    //   pointBorderWidth: 1,
    //   pointHoverRadius: 5,
    //   pointHoverBackgroundColor: "rgba(255, 99, 132,1)",
    //   pointHoverBorderColor: "rgba(220,220,220,1)",
    //   pointHoverBorderWidth: 2,
    //   pointRadius: 1,
    //   pointHitRadius: 10,
    //   data: [],
    // },
    {
      label: "stEth",
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
    {
      label: "rEth",
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
  ],
};

const LineChart = (data: any) => {
  const chartData = useMemo(() => {
    const internalChartData = cloneDeep(dataConfig);
    internalChartData.labels = data.data.timestamps;
    internalChartData.datasets.forEach((dataset, index) => {
      dataset.data = data.data.amounts[index];
      dataset.label = data.data.namedLabels[index];
    });
    // Todo: change dataset generation
    if (data.data.namedLabels.length === 1) {
      internalChartData.datasets.pop();
    }
    return internalChartData;
  }, [data]);

  return (
    <Line
      data={chartData}
      title={data.title}
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
