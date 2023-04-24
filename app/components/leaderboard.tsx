"use client";

import { roundToDecimalPlaces } from "@/lib/utils";

export default function LeaderBoard(data: {
  title: string;
  boardData: { depositor: string; total_deposits: number }[];
}) {
  let boardData = data.boardData;
  return (
    <div className="mt-16">
      <h3 className="text-center text-xl">{data.title}</h3>
      {boardData?.length ? (
        <p className="py-4 px-6 text-left text-sm">
          Showing {boardData.length} top stakers
        </p>
      ) : (
        <p className="py-4 px-6 text-left text-sm">No staker yet</p>
      )}

      {boardData?.length && (
        <div className="table-responsive">
          <table className="table-auto w-full border-collapse   shadow-md rounded-md mt-8">
            <thead className=" text-base">
              <tr>
                <th className="py-4 px-6 text-left"> </th>
                <th className="py-4 px-6 text-left">Staker address</th>
                <th className="py-4 px-6 text-left text-sm md:text-base">
                  Total Staked
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {boardData.map((userData, index) => (
                <tr key={index}>
                  <td className="py-4 px-6 text-left">{index + 1}</td>
                  <td className="py-4 px-6 text-left">{userData.depositor}</td>
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
