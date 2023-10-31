"use client";

import "chart.js/auto";
import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { ChartData } from "chart.js/auto";

import { SupportedToken, TokenRecord } from "@/app/utils/types";
import { getTokenInfo } from "@/app/utils/constants";

const tokenDatasets: TokenRecord<ChartData<"bar">["datasets"][number]> = {
  stEth: {
    backgroundColor: ["rgba(26, 12, 109, 0.6)"],
    borderColor: ["rgba(26, 12, 109, 1)"],
    borderWidth: 1,
    data: [],
  },
  rEth: {
    backgroundColor: ["rgba(255, 184, 0, 0.6)"],
    borderColor: ["rgba(255, 184, 0, 1)"],
    borderWidth: 1,
    data: [],
  },
  cbEth: {
    backgroundColor: ["rgba(0, 153, 153, 0.6)"],
    borderColor: ["rgba(0, 153, 153, 1)"],
    borderWidth: 1,
    data: [],
  },
  beacon: {
    backgroundColor: "rgba(254, 156, 147, 0.6)",
    borderColor: ["rgba(254, 156, 147, 1)"],
    borderWidth: 1,
    data: [],
  },
};

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

  return (
    <Bar
      data={chartData}
      options={{
        maintainAspectRatio: true,
        responsive: true,
        normalized: true,
        scales: {
          x: { stacked: true, min: 0 },
          y: { stacked: true },
        },
        color: "rgb(26, 12, 109)",
      }}
    />
  );
};
