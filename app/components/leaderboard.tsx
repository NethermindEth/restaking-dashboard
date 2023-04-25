"use client";

import { UserData, getGoerliUrl, roundToDecimalPlaces } from "@/lib/utils";
import { useState } from "react";

export default function LeaderBoard(data: any) {
  const [activeData, setActiveData] = useState(data.boardData.ethStakers);
  const [activeButton, setActiveButton] = useState(0);

  const handleToggleContent = (data: UserData[], index: number) => {
    setActiveData(data);
    setActiveButton(index);
  };

  return (
    <div className="mt-16 w-full">
      <h3 className="text-center text-xl">{data.title}</h3>
      <div className="flex flex-row mt-3 w-full">
        <button
          className={`${
            activeButton === 0 ? "button-active" : "button-inactive"
          } py-1 px-4 mr-2 grow border rounded focus:outline-none text-sm`}
          onClick={() => handleToggleContent(data.boardData.ethStakers, 0)}
        >
          Total staked
        </button>
        <button
          className={`${
            activeButton === 1 ? "button-active" : "button-inactive"
          } py-1 px-4 mr-2 grow border rounded focus:outline-none text-sm`}
          onClick={() =>
            handleToggleContent(data.boardData.beaconchainethStakers, 1)
          }
        >
          Beacon Chain ETH
        </button>
        <button
          className={`${
            activeButton === 2 ? "button-active" : "button-inactive"
          } py-1 px-4 mr-2 grow border rounded focus:outline-none text-sm`}
          onClick={() => handleToggleContent(data.boardData.rethStakers, 2)}
        >
          rETH
        </button>
        <button
          className={`${
            activeButton === 3 ? "button-active" : "button-inactive"
          } py-1 px-4 mr-2 grow border rounded focus:outline-none text-sm`}
          onClick={() => handleToggleContent(data.boardData.stethStakers, 3)}
        >
          stETH
        </button>
      </div>
      {activeData?.length ? (
        <p />
      ) : (
        <p className="py-6 px-6 text-left text-sm">No staker yet</p>
      )}
      {activeData?.length && (
        <div className="table-container w-full mt-6 overflow-y-scroll overflow-x-hidden">
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
                .slice(0, 15)
                .map((userData, index) => (
                  <tr key={index}>
                    <td className="py-4 px-4 text-left text-md">{index + 1}</td>
                    <td
                      className="py-4 px-4 text-left text-sm"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        window.open(getGoerliUrl(userData.depositor));
                      }}
                    >
                      {userData.depositor}
                    </td>
                    <td className="py-4 px-4 text-left text-sm">
                      {roundToDecimalPlaces(userData.total_deposits)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
