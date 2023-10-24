"use client";
import { cloneDeep } from "lodash";
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
    const internalChartData = cloneDeep(dataConfig);
    const filteredAmounts = data.data.amounts.filter(
      (amount: number) => amount !== 0
    );
    const filteredLabels = data.data.labels.filter(
      (_: any, index: number) => data.data.amounts[index] !== 0
    );

    internalChartData.datasets[0].data = filteredAmounts;
    internalChartData.labels = filteredLabels;
    return internalChartData;
  }, [data]);

  return <Pie data={chartData} width={"100%"} />;
};

export default PieChart;
