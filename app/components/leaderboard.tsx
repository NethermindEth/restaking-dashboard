"use client";

import { UserData, roundToDecimalPlaces } from "@/lib/utils";
import { useState } from "react";

export default function LeaderBoard(data: any) {
  const [activeData, setActiveData] = useState(data.boardData.ethStakers);
  const [activeButton, setActiveButton] = useState(0);

  const handleToggleContent = (data: UserData[], index: number) => {
    setActiveData(data);
    setActiveButton(index);
  };

  return (
    <div className="mt-16">
      <h3 className="text-center text-xl">{data.title}</h3>
      <div className="flex justify-content mt-3">
        <button
          className={`${
            activeButton === 0 ? "button-active" : "button-inactive"
          } py-2 px-4 mr-2 border rounded focus:outline-none`}
          onClick={() => handleToggleContent(data.boardData.ethStakers, 0)}
        >
          Total staked
        </button>
        <button
          className={`${
            activeButton === 1 ? "button-active" : "button-inactive"
          } py-2 px-4 mr-2 border rounded focus:outline-none`}
          onClick={() =>
            handleToggleContent(data.boardData.beaconchainethStakers, 1)
          }
        >
          beacon chain ETH board
        </button>
        <button
          className={`${
            activeButton === 2 ? "button-active" : "button-inactive"
          } py-2 px-4 mr-2 border rounded focus:outline-none`}
          onClick={() => handleToggleContent(data.boardData.rethStakers, 2)}
        >
          rEth board
        </button>
        <button
          className={`${
            activeButton === 3 ? "button-active" : "button-inactive"
          } py-2 px-4 mr-2 border rounded focus:outline-none`}
          onClick={() => handleToggleContent(data.boardData.stethStakers, 3)}
        >
          stEth board
        </button>
      </div>
      {activeData?.length ? (
        <p />
      ) : (
        <p className="py-4 px-6 text-left text-sm">No staker yet</p>
      )}
      {activeData?.length && (
        <div className="table-responsive">
          <table className="table-auto w-full border-collapse shadow-md rounded-md mt-8">
            <thead className=" text-base">
              <tr>
                <th className="py-4 px-6 text-left"> Rank</th>
                <th className="py-4 px-6 text-left">Staker address</th>
                <th className="py-4 px-6 text-left text-sm md:text-base">
                  Total Staked
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(activeData as UserData[])
                .slice(0, 25)
                .map((userData, index) => (
                  <tr key={index}>
                    <td className="py-4 px-6 text-left">{index + 1}</td>
                    <td className="py-4 px-6 text-left">
                      {userData.depositor}
                    </td>
                    <td className="py-4 px-6 text-left">
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
