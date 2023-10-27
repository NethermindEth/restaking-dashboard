"use client";
import { SupportedToken, TokenRecord } from "@/app/utils/types";
import { cloneDeep } from "lodash";
import { useMemo } from "react";
import { Pie } from "react-chartjs-2";

const tokens: TokenRecord<{ backgroundColor: string, hoverBackgroundColor: string}> = {
  stEth: {
    backgroundColor: "rgba(26, 12, 109, 1)",
    hoverBackgroundColor: "rgba(26, 12, 109, 0.6)",
  },
  rEth: {
    backgroundColor: "rgba(255, 184, 0, 1)",
    hoverBackgroundColor: "rgba(255, 184, 0, 0.6)",
  },
  cbEth: {
    backgroundColor: "rgba(0, 153, 153, 1)",
    hoverBackgroundColor: "rgba(0, 153, 153, 0.6)",
  },
  beacon: {
    backgroundColor: "rgba(254, 156, 147, 1)",
    hoverBackgroundColor: "rgba(254, 156, 147, 0.6)",
  },
};

const PieChart = (data: any) => {
  const chartData = useMemo(() => ({
    labels: data.data.labels,
    datasets: [
      {
        data: data.data.amounts,
        backgroundColor: data.data.tokens.map((token: SupportedToken) => tokens[token].backgroundColor),
        hoverBackgroundColor: data.data.tokens.map((token: SupportedToken) => tokens[token].hoverBackgroundColor),
      }
    ],
  }), [data]);

  return <Pie data={chartData} width={"100%"} />;
};

export default PieChart;
