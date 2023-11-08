"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import { LeaderboardStaker, useLeaderboard } from "@/app/components/hooks/useLeaderboard";
import { getEtherscanAddressUrl, getShortenedAddress} from "@/app/utils/address";
import { SupportedNetwork, SupportedToken } from "@/app/utils/types";
import { getNetworkTokens, getTokenInfo } from "@/app/utils/constants";

interface LeaderboardProps {
  network: SupportedNetwork;
}

export default function Leaderboard({ network }: LeaderboardProps) {
  const { data: leaderboardData, isLoading: isLeaderboardLoading } = useLeaderboard(network);

  const PAGE_SIZE = 10;

  const [activeTab, setActiveTab] = useState<"total" | SupportedToken>("total");
  const [activeData, setActiveData] = useState<LeaderboardStaker[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const tokens = getNetworkTokens(network);

  useEffect(() => {
    setActiveTab("total");
  }, [network]);

  useEffect(() => {
    if (!leaderboardData) return;

    if (activeTab === "total") {
      setActiveData(leaderboardData.total);
    }
    else {
      setActiveData(leaderboardData.partial[activeTab] || []);
    }
    
    setTotalPages(Math.ceil(activeData.length / PAGE_SIZE));
    setCurrentPage(0);
  }, [activeTab, leaderboardData]);

  return (
    <div className="mt-16 w-full">
      <h3 className="text-center text-xl">Restaking Leaderboard</h3>
      <div className="flex flex-col lg:flex-row mt-3 w-full">
        <button
          className={`table-button table-button-totals-${(activeTab === "total") ? "active" : "inactive"} py-3 px-4 lg:mr-2 grow border rounded focus:outline-none text-sm shadow-lg`}
          onClick={() => setActiveTab("total")}
        >
          Total staked
        </button>
        {tokens.map((token, idx) => (
          <button
            key={idx}
            className={`table-button table-button-${getTokenInfo(token).classId}-${(activeTab === token) ? "active" : "inactive"} py-3 px-4 lg:mr-2 grow border rounded focus:outline-none text-sm shadow-lg`}
            onClick={() => setActiveTab(token)}
          >
            {getTokenInfo(token).label}
          </button>
        ))}
      </div>
      <div className="leaderboard-table w-full mt-3 overflow-x-scroll">
        <table className="table table-fixed w-full border-collapse">
          <thead className={`text-base table-head table-head-${(activeTab === "total") ? "total" : getTokenInfo(activeTab).classId}`}>
            <tr>
              <th className="py-3 px-4 text-left w-1/6">Rank</th>
              <th className="py-3 px-4 text-left w-3/6 sm:w-4/6">Address</th>
              <th className="py-3 px-4 text-right w-2/6 sm:w-1/6">Total Staked</th>
            </tr>
          </thead>
          <tbody>
            {(activeData.length && activeData.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)
              .map((userData, idx) => (
                <tr className="border-b-2" key={idx}>
                  <td className="py-4 px-4 text-left text-md">
                    {currentPage * PAGE_SIZE + idx + 1}
                  </td>
                  <td className="py-4 px-4 text-left text-sm font-normal table-cell truncate">
                    <Link href={getEtherscanAddressUrl(userData.depositor)} target="_blank">
                      <span className="sm:hidden">
                        {
                          userData.depositor?.endsWith(".eth")
                            ? userData.depositor
                            : getShortenedAddress(userData.depositor, 4, 6)
                        }
                      </span>
                      <span className="hidden sm:inline-block">
                        {userData.depositor}
                      </span>
                    </Link>
                  </td>
                  <td className="py-4 px-4 text-right text-sm">
                    {userData.totalEth.toFixed(2)}
                  </td>
                </tr>
              ))) || null}
              {(!activeData.length && isLeaderboardLoading && Array.from({ length: PAGE_SIZE }).map((_, idx) => (
                <tr className="border-b-2 animate-pulse" key={idx}>
                  <td className="py-4 px-4 text-left text-md">
                    <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-300 w-50"></div>
                  </td>
                  <td className="py-4 px-4 text-left text-sm font-normal w-full table-cell">
                    <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-300"></div>
                  </td>
                  <td className="py-4 px-4 text-right text-sm">
                    <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-300 w-24"></div>
                  </td>
                </tr>
              ))) || null}
          </tbody>
        </table>

        <div className=" pagination flex justify-center items-center mt-4 pb-6">
          <button
            className={`${currentPage === 0 ? "disabled-arrow" : ""}`}
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!activeData.length || currentPage === 0}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          {(activeData.length)? (
            <p className="mx-4">
              Page {currentPage + 1} of {totalPages}
            </p>
          ) : (
            <p className="mx-4">
              Page 1 of 1
            </p>
          )}
          <button
            className={`${
              currentPage === totalPages ? "disabled-arrow" : ""
            }`}
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!activeData.length || currentPage === totalPages - 1}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    </div>
  );
}
