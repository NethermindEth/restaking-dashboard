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
  const { data: leaderboardData } = useLeaderboard(network);

  const PAGE_SIZE = 10;

  const [activeTab, setActiveTab] = useState<"total" | SupportedToken>("total");
  const [activeData, setActiveData] = useState<LeaderboardStaker[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const tokens = getNetworkTokens(network);

  useEffect(() => {
    if (!leaderboardData) return;

    setActiveTab("total");
  }, [network, leaderboardData]);

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
      {activeData?.length ? (
        <div className="leaderboard-table w-full mt-3 overflow-x-scroll">
          <table className="table w-full border-collapse">
            <thead
              className={`text-base table-head table-head-${(activeTab === "total") ? "total" : getTokenInfo(activeTab).classId}`}
            >
              <tr>
                <th className="py-3 px-4 text-left">Rank</th>
                <th className="py-3 px-4 text-left">Address</th>
                <th className="py-3 px-4 text-right">Total Staked</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {activeData.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)
                .map((userData, index) => (
                  <tr className="border-b-2" key={index}>
                    <td className="py-4 px-4 text-left text-md">
                      {currentPage * PAGE_SIZE + index + 1}
                    </td>
                    <Link href={getEtherscanAddressUrl(userData.depositor)} target="_blank">
                      <td className="py-4 px-4 text-left text-sm font-normal w-full table-cell lg:hidden">
                        {
                          userData.depositor?.endsWith(".eth")
                            ? userData.depositor
                            : getShortenedAddress(userData.depositor, 4, 6)
                        }
                      </td>
                    </Link>
                    <Link href={getEtherscanAddressUrl(userData.depositor)} target="_blank">
                      <td className="py-4 px-4 text-left text-sm font-normal w-full hidden lg:table-cell">
                        {userData.depositor}
                      </td>
                    </Link>
                    <td className="py-4 px-4 text-right text-sm">
                      {userData.totalEth.toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <div className=" pagination flex justify-center items-center mt-4 pb-6">
            <button
              className={`${currentPage === 0 ? "disabled-arrow" : ""}`}
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <p className="mx-4">
              Page {currentPage + 1} of {totalPages}
            </p>
            <button
              className={`${
                currentPage === totalPages ? "disabled-arrow" : ""
              }`}
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
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
