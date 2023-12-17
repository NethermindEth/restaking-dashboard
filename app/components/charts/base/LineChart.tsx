"use client";

import { useMemo } from "react";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import { SupportedToken, TokenRecord, supportedTokens } from "@/app/utils/types";
import { ChartData } from "chart.js/auto";
import { getTokenInfo } from "@/app/utils/constants";

const tokenDatasets = supportedTokens.reduce((acc, token) => {
  const info = getTokenInfo(token);

  acc[token] = {
    fill: false,
    pointStyle: "rect",
    backgroundColor: `${info.color}99`,
    borderColor: info.color,
    borderDash: [],
    borderDashOffset: 0.0,
    pointBorderColor: info.color,
    pointBackgroundColor: "#fff",
    pointBorderWidth: 1,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: `${info.color}99`,
    pointHoverBorderColor: info.color,
    pointHoverBorderWidth: 2,
    pointRadius: 1,
    pointHitRadius: 10,
    data: [],
  };

  return acc;
}, {} as TokenRecord<ChartData<"line">["datasets"][number]>);

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

  const isEmpty = useMemo(() => amounts.every(el => el.length === 0), [amounts]);

  return (
    <Line
      data={chartData}
      title={title}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        normalized: true,
        color: "rgb(26, 12, 109)",
        ...(isEmpty && {
          scales: {
            y: {
              ticks: {
                display: false,
              },
            },
          }
        }),
      }}
      style={{ height: "300px" }}
    />
  );
};
