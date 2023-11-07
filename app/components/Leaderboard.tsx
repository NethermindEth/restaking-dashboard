"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import { LeaderboardStaker, useLeaderboard } from "@/app/components/hooks/useLeaderboard";
import { getEtherscanAddressUrl, getShortenedAddress} from "@/app/utils/address";
import { SupportedNetwork } from "@/app/utils/types";
import { getNetworkTokens, getTokenInfo } from "@/app/utils/constants";

interface LeaderboardProps {
  network: SupportedNetwork;
}

export default function Leaderboard({ network }: LeaderboardProps) {
  const { data: leaderboardData } = useLeaderboard(network);

  const [activeData, setActiveData] = useState<LeaderboardStaker[]>([]);
  const [activeButton, setActiveButton] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!leaderboardData) return;

    setActiveData(leaderboardData.total);
    setActiveButton(0);
    setCurrentPage(1);
  }, [network, leaderboardData]);

  if (!leaderboardData) return <></>;

  const tokens = getNetworkTokens(network);
  const tokenLabels = tokens.map(token => getTokenInfo(token).label);

  const tabKeys = ["totals", ...tokenLabels].map(el => el.toLowerCase());

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(activeData.length / PAGE_SIZE);

  const handleToggleContent = (data: LeaderboardStaker[], index: number) => {
    setActiveData(data);
    setActiveButton(index);
  };

  const getActiveTabName = (activeButton: number) => {
    return (tabKeys[activeButton] || "").toLowerCase();
  };

  return (
    <div className="mt-16 w-full">
      <h3 className="text-center text-xl">Restaking Leaderboard</h3>
      <div className="flex flex-col lg:flex-row mt-3 w-full">
        <button
          className={`table-button ${
            activeButton === 0
              ? "table-button-totals-active"
              : "table-button-totals-inactive"
          } py-3 px-4 lg:mr-2 grow border rounded focus:outline-none text-sm shadow-lg`}
          onClick={() => {
            handleToggleContent(leaderboardData.total, 0);
            setCurrentPage(1);
          }}
        >
          Total staked
        </button>
        {tokens.map((token, idx) => (
          <button
            key={token}
            className={`table-button ${
              activeButton === (idx + 1)
                ? `table-button-${token.toLowerCase()}-active`
                : `table-button-${token.toLowerCase()}-inactive`
            } py-3 px-4 lg:mr-2 grow border rounded focus:outline-none text-sm shadow-lg`}
            onClick={() => {
              handleToggleContent(
                leaderboardData.partial[token]!,
                idx + 1
              );
              setCurrentPage(1);
            }}
          >
            {tokenLabels[idx]}
          </button>
        ))}
      </div>
      {activeData?.length ? (
        <div className="leaderboard-table w-full mt-3 overflow-x-scroll">
          <table className="table w-full border-collapse">
            <thead
              className={`text-base table-head table-head-${getActiveTabName(
                activeButton
              )}`}
            >
              <tr>
                <th className="py-3 px-4 text-left">Rank</th>
                <th className="py-3 px-4 text-left">Address</th>
                <th className="py-3 px-4 text-left">Total Staked</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(activeData as LeaderboardStaker[])
                .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                .map((userData, index) => (
                  <tr className="border-b-2" key={index}>
                    <td className="py-4 px-4 text-left text-md">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td
                      className="py-4 px-4 text-left text-sm font-normal w-full table-cell lg:hidden"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        window.open(getEtherscanAddressUrl(userData.depositor));
                      }}
                    >
                      {userData.depositor?.endsWith(".eth")
                        ? userData.depositor
                        : getShortenedAddress(userData.depositor, 4, 6)}
                    </td>
                    <td
                      className="py-4 px-4 text-left text-sm font-normal w-full hidden lg:table-cell"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        window.open(getEtherscanAddressUrl(userData.depositor));
                      }}
                    >
                      {userData.depositor}
                    </td>
                    <td className="py-4 px-4 text-right text-sm">
                      {userData.totalEth.toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <div className=" pagination flex justify-center items-center mt-4 pb-6">
            <button
              className={`${currentPage === 1 ? "disabled-arrow" : ""}`}
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <p className="mx-4">
              Page {currentPage} of {totalPages}
            </p>
            <button
              className={`${
                currentPage === totalPages ? "disabled-arrow" : ""
              }`}
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      ) : (
        <p className="py-6 px-6 text-left text-sm">No staker yet</p>
      )}
    </div>
  );
}