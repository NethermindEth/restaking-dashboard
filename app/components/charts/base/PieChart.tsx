"use client";

import { useMemo } from "react";
import { Pie } from "react-chartjs-2";

import { getTokenInfo } from "@/app/utils/constants";
import { SupportedToken, TokenRecord } from "@/app/utils/types";

const tokenColors: TokenRecord<{ backgroundColor: string; hoverBackgroundColor: string }> = {
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

export interface PieChartProps {
  amounts: Array<string | number>;
  tokens: SupportedToken[];
}

export default function PieChart({ amounts, tokens }: PieChartProps) {
  const chartData = useMemo(() => ({
    labels: tokens.map(token => getTokenInfo(token).label),
    datasets: [
      {
        data: amounts,
        backgroundColor: tokens.map(token => tokenColors[token].backgroundColor),
        hoverBackgroundColor: tokens.map(token => tokenColors[token].hoverBackgroundColor),
      },
    ],
  }), [amounts, tokens]);

  return <Pie data={chartData} width={"100%"} />;
};
