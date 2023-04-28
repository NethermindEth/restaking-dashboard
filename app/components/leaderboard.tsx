"use client";

import { UserData, getGoerliUrl, roundToDecimalPlaces } from "@/lib/utils";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { ethers } from "ethers";

export default function LeaderBoard(data: any) {
  const provider = new ethers.JsonRpcProvider(
    "https://rpc.ankr.com/eth_goerli"
  );
  const [activeData, setActiveData] = useState(data.boardData.ethStakers);
  const [activeButton, setActiveButton] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(activeData.length / PAGE_SIZE);

  const handleToggleContent = (data: UserData[], index: number) => {
    setActiveData(data);
    setActiveButton(index);
  };

  return (
    <div className="mt-16 w-full">
      <h3 className="text-center text-xl">{data.title}</h3>
      <div className="flex flex-col lg:flex-row mt-3 w-full">
        <button
          className={`${
            activeButton === 0 ? "data-card-steth" : "button-inactive-total"
          } py-1 px-4 mr-2 grow border shadow-lg rounded-md focus:outline-none text-sm`}
          onClick={() => {
            handleToggleContent(data.boardData.ethStakers, 0);
            setCurrentPage(1);
          }}
        >
          Total staked
        </button>
        <button
          className={`${
            activeButton === 3 ? "data-card-steth" : "button-inactive-steth"
          } py-1 px-4 mr-2 grow border shadow-lg rounded-md focus:outline-none text-sm`}
          onClick={() => {
            handleToggleContent(data.boardData.stethStakers, 3);
            setCurrentPage(1);
          }}
        >
          stETH
        </button>
        <button
          className={`${
            activeButton === 2 ? "data-card-steth" : "button-inactive-reth"
          } py-1 px-4 mr-2 grow border shadow-lg rounded-md focus:outline-none text-sm`}
          onClick={() => {
            handleToggleContent(data.boardData.rethStakers, 2);
            setCurrentPage(1);
          }}
        >
          rETH
        </button>
        <button
          className={`${
            activeButton === 1 ? "data-card-steth" : "button-inactive-eth"
          } py-1 px-4 mr-2 grow border shadow-lg rounded-md focus:outline-none text-sm`}
          onClick={() => {
            handleToggleContent(data.boardData.beaconchainethStakers, 1);
            setCurrentPage(1);
          }}
        >
          Beacon Chain ETH
        </button>
      </div>
      {activeData?.length ? (
        <p />
      ) : (
        <p className="py-6 px-6 text-left text-sm">No staker yet</p>
      )}
      {activeData?.length && (
        <div className="w-full mt-6 overflow-x-scroll">
          <table className="table w-full shadow-md  overflow-x-scroll rounded-md border-1">
            <thead className="text-base">
              <tr className="w-full">
                <th className="py-3 px-4 text-left rank-row">Rank</th>
                <th className="py-3 px-4 text-left address-row">Address</th>
                <th className="py-3 px-4 text-left amount-row">Total Staked</th>
              </tr>
            </thead>
            <tbody>
              {(activeData as UserData[])
                .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                .map((userData, index) => (
                  <tr key={index} className="w-full">
                    <td className="py-4 px-4 text-left text-md rank-row">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td
                      className="py-4 px-4 text-left text-sm font-light address-row overflow-x-hidden"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        window.open(getGoerliUrl(userData.depositor));
                      }}
                    >
                      {userData.depositor}
                    </td>
                    <td className="py-4 px-4 text-left text-sm amount-row overflow-x-scroll">
                      {roundToDecimalPlaces(userData.total_deposits)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <div className="pagination flex justify-center items-center mt-4">
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
      )}
    </div>
  );
}
