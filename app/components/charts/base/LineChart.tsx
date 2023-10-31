"use client";

import { useMemo } from "react";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import { SupportedToken, TokenRecord } from "@/app/utils/types";
import { ChartData } from "chart.js/auto";
import { getTokenInfo } from "@/app/utils/constants";

const tokenDatasets: TokenRecord<ChartData<"line">["datasets"][number]> = {
  stEth: {
    fill: false,
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
  rEth: {
    fill: false,
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
  cbEth: {
    fill: false,
    backgroundColor: "rgba(0, 153, 153, 0.6)",
    borderColor: "rgba(0, 153, 153, 1)",
    pointStyle: "rect",
    borderDash: [],
    borderDashOffset: 0.0,
    pointBorderColor: "rgba(0, 153, 153, 1)",
    pointBackgroundColor: "#fff",
    pointBorderWidth: 1,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: "rgba(0, 153, 153, 1)",
    pointHoverBorderColor: "rgba(0, 153, 153, 1)",
    pointHoverBorderWidth: 2,
    pointRadius: 1,
    pointHitRadius: 10,
    data: [],
  },
  beacon: {
    fill: false,
    backgroundColor: "rgba(254, 156, 147, 0.6)",
    borderColor: "rgba(254, 156, 147, 1)",
    pointStyle: "rect",
    borderDash: [],
    borderDashOffset: 0.0,
    pointBorderColor: "rgba(254, 156, 147, 1)",
    pointBackgroundColor: "#fff",
    pointBorderWidth: 1,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: "rgba(254, 156, 147, 1)",
    pointHoverBorderColor: "rgba(254, 156, 147, 1)",
    pointHoverBorderWidth: 2,
    pointRadius: 1,
    pointHitRadius: 10,
    data: [],
  },
};

export interface LineChartProps {
  title: string;
  amounts: Array<string | number>[];
  timestamps: string[];
  tokens: SupportedToken[];
}

export default function LineChart({ title, amounts, timestamps, tokens}: LineChartProps) {
  const chartData = useMemo(() => ({
    labels: timestamps,
    datasets: tokens.map((token, idx) => ({
      ...tokenDatasets[token],
      label: getTokenInfo(token).label,
      data: amounts[idx],
    })),
  }), [title, amounts, timestamps, tokens]);

  return (
    <Line
      data={chartData}
      title={title}
      options={{
        maintainAspectRatio: true,
        responsive: true,
        normalized: true,
        color: "rgb(26, 12, 109)",
      }}
    />
  );
};
