"use client";

import { useMemo } from "react";
import { Pie } from "react-chartjs-2";

import { getTokenInfo } from "@/app/utils/constants";
import { SupportedToken, TokenRecord, supportedTokens } from "@/app/utils/types";

const tokenColors = supportedTokens.reduce((acc, token) => {
  const info = getTokenInfo(token);

  acc[token] = {
    backgroundColor: info.color,
    hoverBackgroundColor: `${info.color}99`,
  };

  return acc;
}, {} as TokenRecord<{ backgroundColor: string; hoverBackgroundColor: string }>);

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
