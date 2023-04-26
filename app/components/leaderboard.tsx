"use client";

import { UserData, getGoerliUrl, roundToDecimalPlaces } from "@/lib/utils";
import { useEffect, useState } from "react";
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
  const [ensNames, setEnsNames] = useState<{ [key: string]: string }>({});

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(activeData.length / PAGE_SIZE);

  useEffect(() => {
    async function fetchEnsNames() {
      const cachedEnsNames = localStorage.getItem("ensNames");
      if (cachedEnsNames) {
        setEnsNames(JSON.parse(cachedEnsNames));
      }

      const newEnsNames: { [key: string]: string } = {};
      let namesPromises = [];
      let data: UserData;
      for (data of activeData) {
        if (!ensNames[data.depositor])
          namesPromises.push(provider.lookupAddress(data.depositor));
        else namesPromises.push(ensNames[data.depositor]);
      }
      const names = await Promise.all(namesPromises);

      activeData.forEach((data: UserData, index: number) => {
        newEnsNames[data.depositor] = names[index] || data.depositor;
      });

      setEnsNames((prevEnsNames) => ({ ...prevEnsNames, ...newEnsNames }));
      localStorage.setItem("ensNames", JSON.stringify(ensNames));
    }
    fetchEnsNames();
  }, [activeData]);

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
            activeButton === 0 ? "button-active" : "button-inactive-steth"
          } py-1 px-4 mr-2 grow border rounded focus:outline-none text-sm`}
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
          } py-1 px-4 mr-2 grow border rounded focus:outline-none text-sm`}
          onClick={() => {
            handleToggleContent(data.boardData.stethStakers, 3);
            setCurrentPage(1);
          }}
        >
          stETH
        </button>
        <button
          className={`${
            activeButton === 2 ? "data-card-reth" : "button-inactive-reth"
          } py-1 px-4 mr-2 grow border rounded focus:outline-none text-sm`}
          onClick={() => {
            handleToggleContent(data.boardData.rethStakers, 2);
            setCurrentPage(1);
          }}
        >
          rETH
        </button>
        <button
          className={`${
            activeButton === 1 ? "data-card-eth" : "button-inactive-eth"
          } py-1 px-4 mr-2 grow border rounded focus:outline-none text-sm`}
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
          <table className="table w-full border-collapse shadow-md rounded-md">
            <thead className="text-base">
              <tr>
                <th className="py-3 px-4 text-left">Rank</th>
                <th className="py-3 px-4 text-left">Address</th>
                <th className="py-3 px-4 text-left">Total Staked</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(activeData as UserData[])
                .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                .map((userData, index) => (
                  <tr key={index}>
                    <td className="py-4 px-4 text-left text-md">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td
                      className="py-4 px-4 text-left text-sm"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        window.open(getGoerliUrl(userData.depositor));
                      }}
                    >
                      {ensNames[userData.depositor]}
                    </td>
                    <td className="py-4 px-4 text-left text-sm">
                      {roundToDecimalPlaces(userData.total_deposits)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <div className=" pagination flex justify-center items-center mt-4">
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
