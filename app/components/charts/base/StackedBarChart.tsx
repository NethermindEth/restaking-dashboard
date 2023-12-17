"use client";

import "chart.js/auto";
import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { ChartData } from "chart.js/auto";

import { SupportedToken, TokenRecord, supportedTokens } from "@/app/utils/types";
import { getTokenInfo } from "@/app/utils/constants";

const tokenDatasets = supportedTokens.reduce((acc, token) => {
  const info = getTokenInfo(token);

  acc[token] = {
    backgroundColor: [`${info.color}99`],
    borderColor: [info.color],
    borderWidth: 1,
    data: [],
  };

  return acc;
}, {} as TokenRecord<ChartData<"bar">["datasets"][number]>);

export interface StackedBarChartProps {
  title: string;
  tokens: SupportedToken[];
  amounts: Array<string | number>[];
  timestamps: string[];
}

export default function StackedBarChart({ title, tokens, amounts, timestamps }: StackedBarChartProps) {
  const chartData = useMemo(() => ({
    labels: timestamps,
    datasets: tokens.map((token, idx) => ({
      ...tokenDatasets[token],
      label: getTokenInfo(token).label,
      data: amounts[idx],
    })),
  }), [title, tokens, amounts, timestamps]);

  const isEmpty = useMemo(() => amounts.every(el => el.length === 0), [amounts]);

  return (
    <Bar
      data={chartData}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        normalized: true,
        scales: {
          x: { stacked: true, min: 0 },
          y: { stacked: true, ...(isEmpty && { ticks: { display: false } }) },
        },
        color: "rgb(26, 12, 109)",
      }}
      style={{ height: "300px" }}
    />
  );
};
