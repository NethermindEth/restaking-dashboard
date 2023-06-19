"use client";
import { useMemo } from "react";
import { Pie } from "react-chartjs-2";

const dataConfig = {
  labels: [],
  datasets: [
    {
      data: [],
      backgroundColor: [
        "rgba(26, 12, 109, 1)",
        "rgba(255, 184, 0, 1)",
        "rgba(0, 153, 153, 1)",
        "rgba(254, 156, 147, 1)",
      ],
      hoverBackgroundColor: [
        "rgba(26, 12, 109, 0.6)",
        "rgba(255, 184, 0, 0.6)",
        "rgba(0, 153, 153, 1)",
        "rgba(254, 156, 147, 0.6)",
      ],
    },
  ],
};

const PieChart = (data: any) => {
  const chartData = useMemo(() => {
    const internalChartData = dataConfig;

    internalChartData.datasets[0].data = data.data.amounts;
    internalChartData.labels = data.data.labels;

    if (data.data.labels.length === 3) {
      internalChartData.datasets[0].backgroundColor = [
        "rgba(26, 12, 109, 1)",
        "rgba(255, 184, 0, 1)",
        "rgba(254, 156, 147, 1)",
      ];
      internalChartData.datasets[0].hoverBackgroundColor = [
        "rgba(26, 12, 109, 0.6)",
        "rgba(255, 184, 0, 0.6)",
        "rgba(254, 156, 147, 0.6)",
      ];
    }
    return internalChartData;
  }, [data]);

  return <Pie data={chartData} width={"100%"} />;
};

export default PieChart;
