import { supabase } from "@/lib/supabaseClient";
import {
  BlockData,
  mergeBlockChunks,
  roundToDecimalPlaces,
  sumTotalAmounts,
} from "@/lib/utils";
import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

const logo = fetch(new URL("../../public/logo.png", import.meta.url)).then(
  (res) => res.arrayBuffer()
);

const stEthLogo = fetch(
  new URL("../../public/steth_logo.png", import.meta.url)
).then((res) => res.arrayBuffer());

const rEthLogo = fetch(new URL("../../public/reth.png", import.meta.url)).then(
  (res) => res.arrayBuffer()
);

const beaconEthLogo = fetch(
  new URL("../../public/beaconChainETH.png", import.meta.url)
).then((res) => res.arrayBuffer());

export default async function () {
  const {
    totalrEthDeposits,
    totalstEthDeposits,
    totalstEthWithdrawals,
    totalrEthWithdrawals,
    totalBeaconChainStakes,
  } = await getDeposits();
  const [logoData, stEthLogoData, rEthLogoData, beaconEthLogoData] =
    await Promise.all([logo, stEthLogo, rEthLogo, beaconEthLogo]);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          fontWeight: "bold",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          textAlign: "center",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(to bottom, rgb(255, 255, 255), rgb(100, 156, 240))",
          fontFamily: '"Abcreprovariable"',
        }}
      >
        <div
          style={{ display: "flex" }}
          tw="z-10 max-w-5xl items-center justify-between font-mono text-sm"
        >
          <div
            style={{ display: "flex" }}
            tw="items-center justify-center static h-auto w-auto bg-none lgmb-12"
          >
            <img
              alt="EigenLayer Logo"
              width="64"
              height="72"
              src={logoData as unknown as string}
            />
            <p tw="text-2xl ml-4">EigenLayer Stats</p>
          </div>
        </div>
        <div
          style={{ display: "flex" }}
          tw="my-8 w-full lg:w-1/2 flex flex-wrap flex-col lg:flex-row lg:flex-nowrap items-stretch justify-center"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: "rgba(235, 235, 235, 1)",
              backgroundColor: "rgb(26, 12, 109)",
              textAlign: "center",
            }}
            tw="grow mt-0 py-8 px-24 mx-4 shadow-lg rounded-md text-center"
          >
            <img
              tw="mx-auto"
              src={stEthLogoData as unknown as string}
              alt="stETH"
              width="48"
              height="48"
            />
            <p tw="text-sm md:text-base">Staked stETH</p>
            <p tw="md:text-xl">
              {roundToDecimalPlaces(totalstEthDeposits - totalstEthWithdrawals)}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: "rgb(26, 12, 109)",
              backgroundColor: "rgb(255, 184, 0)",
              textAlign: "center",
            }}
            tw="grow mt-0 py-8 px-24 mx-4 shadow-lg rounded-md text-center"
          >
            <img
              tw="mx-auto"
              src={rEthLogoData as unknown as string}
              alt="rETH"
              width="48"
              height="48"
            />
            <p tw="text-sm md:text-base">Staked rETH</p>
            <p tw="md:text-xl">
              {roundToDecimalPlaces(totalrEthDeposits - totalrEthWithdrawals)}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: "rgb(26, 12, 109)",
              backgroundColor: "rgb(254, 156, 147)",
              textAlign: "center",
            }}
            tw="grow mt-0 py-8 px-24 mx-4 shadow-lg rounded-md text-center"
          >
            <img
              tw="mx-auto"
              src={beaconEthLogoData as unknown as string}
              alt="ETH"
              width="48"
              height="48"
            />
            <p tw="text-base mx-auto">Beacon Chain ETH</p>
            <p tw="text-xl mx-auto">
              {roundToDecimalPlaces(totalBeaconChainStakes)}
            </p>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 600,
      headers: {
        "Cache-Control": "public, max-age=1800",
      },
    }
  );
}

async function getDeposits() {
  // Deposits
  let { data: rEthDeposits, error: rEthDepositError } = await supabase
    .from("mainnet_consumabledailydepositsreth")
    .select("*");
  rEthDeposits = mergeBlockChunks(rEthDeposits as BlockData[]);
  let totalrEthDeposits = sumTotalAmounts(rEthDeposits as BlockData[]);

  let { data: stEthDeposits, error: stEthDepositError } = await supabase
    .from("mainnet_consumabledailydepositssteth")
    .select("*");
  stEthDeposits = mergeBlockChunks(stEthDeposits as BlockData[]);
  let totalstEthDeposits = sumTotalAmounts(stEthDeposits as BlockData[]);

  let { data: beaconChainStakes } = await supabase
    .from("mainnet_consumablebeaconchainstakeseth")
    .select("*");
  beaconChainStakes = mergeBlockChunks(beaconChainStakes as BlockData[]);
  let totalBeaconChainStakes = sumTotalAmounts(
    beaconChainStakes as BlockData[]
  );

  // Withdrawals
  let { data: rEthWithdrawals, error: rEthWithDrawalsError } = await supabase
    .from("mainnet_consumabledailywithdrawalsreth")
    .select("*");
  rEthWithdrawals = mergeBlockChunks(rEthWithdrawals as BlockData[]);
  let totalrEthWithdrawals = sumTotalAmounts(rEthWithdrawals as BlockData[]);

  let { data: stEthWithdrawals, error: stEthWithDrawalsError } = await supabase
    .from("mainnet_consumabledailywithdrawalssteth")
    .select("*");
  stEthWithdrawals = mergeBlockChunks(stEthWithdrawals as BlockData[]);
  let totalstEthWithdrawals = sumTotalAmounts(stEthWithdrawals as BlockData[]);

  return {
    rEthDeposits,
    totalrEthDeposits,
    stEthDeposits,
    totalstEthDeposits,
    stEthWithdrawals,
    totalstEthWithdrawals,
    totalrEthWithdrawals,
    beaconChainStakes,
    totalBeaconChainStakes,
  };
}
