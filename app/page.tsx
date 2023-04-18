"use client";

import Image from "next/image";
import { Inter } from "next/font/google";
import PieChart from "../charts/PieChart";
import StackedBar from "../charts/stackedBar";
import LineChart from "../charts/LineChart";
import { Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const inter = Inter({ subsets: ["latin"] });

import { supabase } from "../lib/supabaseClient";

export default async function Home() {
  const { deposits } = await getDeposits();
  const latestDeposits = await getLastDeposits();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 ">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          EigenLayer / Nethermind
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <p>Logo / Credits</p>
        </div>
      </div>
      <div className="row deposits-cards">
        <div className="col-4 d-flex">
          <Card bg="primary" text="white" className="mb-4">
            <Card.Body className="pb-0 d-flex justify-content-between align-items-start">
              <div>
                <div className="fs-4 fw-semibold">Total Staked ETH</div>
                <div className="fs-4">{latestDeposits.amountNative}</div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-4 d-flex">
          <Card bg="info" text="white" className="mb-4">
            <Card.Body className="pb-0 d-flex justify-content-between align-items-start">
              <div>
                <div className="fs-4 fw-semibold">Total Staked StEth</div>
                <div className="fs-4">{latestDeposits.amountStEth}</div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-4 d-flex">
          <Card bg="warning" text="white" className="mb-4">
            <Card.Body className="pb-0 d-flex justify-content-between align-items-start">
              <div>
                <div className="fs-4 fw-semibold">Total Staked REth</div>
                <div className="fs-4">{latestDeposits.amountREth}</div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
      <div className="staking-dashboard">
        <div className="chart">
          <h3> PieChart of restaked tokens</h3>
          <PieChart
            data={{
              amounts: [
                latestDeposits.amountNative,
                latestDeposits.amountStEth,
                latestDeposits.amountREth,
              ],
              labels: ["restaked ETH", "restaked StEth", "restaked REth"],
            }}
          />
        </div>
        <div className="row flex-2">
          <div>
            <h3> StackedBar of restaked tokens over last x days</h3>

            <div className="chart-2">
              <StackedBar
                data={{
                  amounts: [
                    [12, 19, 3, 5, 2, 10],
                    [15, 22, 10, 1, 20, 15],
                    [15, 22, 10, 1, 20, 20],
                  ],
                  labels: [
                    "15apr2023",
                    "16apr2023",
                    "17apr2023",
                    "18apr2023",
                    "19apr2023",
                    "20apr2023",
                  ],
                }}
                title="Stacked bar for staked ETH"
              />
            </div>
          </div>
          <div>
            <h3> LineChart of restaked tokens over time</h3>
            <div className="chart-2">
              <LineChart
                data={{
                  title: "Test line chart",
                  amounts: [
                    [12, 19, 3, 5, 2, 10],
                    [15, 22, 10, 1, 20, 15],
                    [15, 2, 20, 10, 20, 20],
                  ],
                  timestamps: [
                    "15apr2023",
                    "16apr2023",
                    "17apr2023",
                    "18apr2023",
                    "19apr2023",
                    "20apr2023",
                  ],
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

async function getDeposits() {
  let { data } = await supabase.from("Deposits").select();

  return {
    deposits: data,
  };
}
async function getLastDeposits() {
  let { data } = await supabase
    .from("Deposits")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  console.log(data);
  return data ? data[0] : {};
}
