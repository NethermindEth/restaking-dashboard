"use client";

import {
  LeaderboardUserData,
  getEtherscanAddressUrl,
  getShortenedAddress,
  roundToDecimalPlaces,
} from "@/lib/utils";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

export default function LeaderBoard(data: any) {
  console.log(data.boardData.ethStakers);
  const [activeData, setActiveData] = useState(data.boardData.ethStakers);
  const [activeButton, setActiveButton] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(activeData.length / PAGE_SIZE);

  const handleToggleContent = (data: LeaderboardUserData[], index: number) => {
    setActiveData(data);
    setActiveButton(index);
  };

  const getActiveTabName = (activeButton: number) => {
    switch (activeButton) {
      case 0:
        return "totals";
      case 1:
        return "beacon";
      case 2:
        return "reth";
      case 3:
        return "steth";
      case 4:
        return "cbeth";
      default:
        return "";
    }
  };

  return (
    <div className="mt-16 w-full">
      <h3 className="text-center text-xl">{data.title}</h3>
      <div className="flex flex-col lg:flex-row mt-3 w-full">
        <button
          className={`table-button ${
            activeButton === 0
              ? "table-button-totals-active"
              : "table-button-totals-inactive"
          } py-3 px-4 lg:mr-2 grow border rounded focus:outline-none text-sm shadow-lg`}
          onClick={() => {
            handleToggleContent(data.boardData.ethStakers, 0);
            setCurrentPage(1);
          }}
        >
          Total staked
        </button>
        {Object.keys(data.boardData.network).map((key, index) => (
          <button
            className={`table-button ${
              activeButton === 3
                ? `table-button-${key.toLowerCase()}-active`
                : `table-button-${key.toLowerCase()}-inactive`
            } py-3 px-4 lg:mr-2 grow border rounded focus:outline-none text-sm shadow-lg`}
            onClick={() => {
              handleToggleContent(
                data.boardData[`${key.toLowerCase()}Stakers`],
                index
              );
              setCurrentPage(1);
            }}
          >
            {key}
          </button>
        ))}

        <button
          className={`table-button ${
            activeButton === 1
              ? "table-button-beacon-active"
              : "table-button-beacon-inactive"
          } py-3 px-4 grow border rounded focus:outline-none text-sm shadow-lg`}
          onClick={() => {
            handleToggleContent(data.boardData.beaconchainethStakers, 1);
            setCurrentPage(1);
          }}
        >
          Beacon Chain ETH
        </button>
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
              {(activeData as LeaderboardUserData[])
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
                      {roundToDecimalPlaces(userData.totalStaked)}
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
