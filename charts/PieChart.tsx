"use client";
import { useMemo } from "react";
import { Pie } from "react-chartjs-2";

const dataConfig = {
  labels: [],
  datasets: [
    {
      data: [],

      backgroundColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(255, 206, 86, 1)",
      ],
      hoverBackgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(255, 206, 86, 0.2)",
      ],
    },
  ],
};

const PieChart = (data: any) => {
  const chartData = useMemo(() => {
    const internalChartData = dataConfig;
    internalChartData.datasets[0].data = data.data.amounts;
    internalChartData.labels = data.data.labels;
    return internalChartData;
  }, [data]);

  return <Pie data={chartData} width={"100%"} />;
};

export default PieChart;
