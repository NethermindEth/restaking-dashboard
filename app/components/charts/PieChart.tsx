"use client";
import { cloneDeep } from "lodash";
import { useMemo } from "react";
import { Pie } from "react-chartjs-2";

const tokenConfig: {[key: string]: { backgroundColor: string; hoverBackgroundColor: string }} = {
    stETH: {
      backgroundColor: "rgba(26, 12, 109, 1)",
      hoverBackgroundColor: "rgba(26, 12, 109, 0.6)",
    },
    "rETH (as ETH)": {
      backgroundColor: "rgba(255, 184, 0, 1)",
      hoverBackgroundColor: "rgba(255, 184, 0, 0.6)",
    },
    "cbETH (as ETH)": {
      backgroundColor: "rgba(0, 153, 153, 1)",
      hoverBackgroundColor: "rgba(0, 153, 153, 0.6)",
    },
    "Beacon Chain ETH": {
      backgroundColor: "rgba(254, 156, 147, 1)",
      hoverBackgroundColor: "rgba(254, 156, 147, 0.6)",
    },
  };

const PieChart = (params: { data: { labels: string[]; amounts: Number[] }}) => {
  const chartData = useMemo(() => {
    const internalConfig = cloneDeep(tokenConfig);
    const dataset: {
      data: Number[];
      backgroundColor: string[];
      hoverBackgroundColor: string[];
    } = {
      data: params.data.amounts,
      backgroundColor: [],
      hoverBackgroundColor: [],
    };

    params.data.labels.forEach((token: string) => {
      const config = internalConfig[token];
      dataset.backgroundColor.push(config.backgroundColor);
      dataset.hoverBackgroundColor.push(config.hoverBackgroundColor);
      return internalConfig[token];
    });

    return {
      labels: params.data.labels,
      datasets: [dataset],
    };
  }, [params]);

  return <Pie data={chartData} redraw width={"100%"} />;
};

export default PieChart;
