import { roundToDecimalPlaces } from "@/lib/utils";
import {
  RocketTokenRETH__factory,
  StakedTokenV1__factory,
  StrategyBaseTVLLimits__factory,
} from "@/typechain";
import { ImageResponse } from "@vercel/og";
import axios from "axios";
import { ethers } from "ethers";

const RETH_ADDRESS = "0xae78736Cd615f374D3085123A210448E74Fc6393";
const CBETH_ADDRESS = "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704";
const STETH_STRATEGY_ADDRESS = "0x93c4b944D05dfe6df7645A86cd2206016c51564D";
const CBETH_STRATEGY_ADDRESS = "0x54945180dB7943c0ed0FEE7EdaB2Bd24620256bc";
const RETH_STRATEGY_ADDRESS = "0x1BeE69b7dFFfA4E2d53C2a2Df135C388AD25dCD2";
const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth");

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

const cbEthLogo = fetch(
  new URL("../../public/cbeth.png", import.meta.url)
).then((res) => res.arrayBuffer());

const beaconEthLogo = fetch(
  new URL("../../public/beaconChainETH.png", import.meta.url)
).then((res) => res.arrayBuffer());

export default async function () {
  const { stEthTvl, rEthTvl, cbEthTvl, totalStakedBeaconChainEth } =
    await getDashboardData();

  const [
    logoData,
    stEthLogoData,
    rEthLogoData,
    cbEthLogoData,
    beaconEthLogoData,
  ] = await Promise.all([logo, stEthLogo, rEthLogo, cbEthLogo, beaconEthLogo]);

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
          tw="my-8 mx-8 w-screen flex flex-wrap flex-col lg:flex-row lg:flex-nowrap items-stretch justify-around"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: "rgba(235, 235, 235, 1)",
              backgroundColor: "rgb(26, 12, 109)",
              textAlign: "center",
            }}
            tw="grow mt-0 py-8 px-18 mx-4 shadow-lg rounded-md text-center"
          >
            <img
              tw="mx-auto"
              src={stEthLogoData as unknown as string}
              alt="stETH"
              width="48"
              height="48"
            />
            <p tw="text-base mx-auto">Staked stETH</p>
            <p tw="text-xl mx-auto">{roundToDecimalPlaces(stEthTvl)}</p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: "rgb(26, 12, 109)",
              backgroundColor: "rgb(255, 184, 0)",
              textAlign: "center",
            }}
            tw="grow mt-0 py-8 px-18 mx-4 shadow-lg rounded-md text-center"
          >
            <img
              tw="mx-auto"
              src={rEthLogoData as unknown as string}
              alt="rETH"
              width="48"
              height="48"
            />
            <p tw="text-base mx-auto">Staked rETH</p>
            <p tw="text-xl mx-auto">{roundToDecimalPlaces(rEthTvl)}</p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: "rgba(235, 235, 235, 1)",
              backgroundColor: "rgb(0, 153, 153)",
              textAlign: "center",
            }}
            tw="grow mt-0 py-8 px-18 mx-4 shadow-lg rounded-md text-center"
          >
            <img
              tw="mx-auto"
              src={cbEthLogoData as unknown as string}
              alt="cbETH"
              width="48"
              height="48"
            />
            <p tw="text-base mx-auto">Staked cbETH</p>
            <p tw="text-xl mx-auto">{roundToDecimalPlaces(cbEthTvl)}</p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: "rgb(26, 12, 109)",
              backgroundColor: "rgb(254, 156, 147)",
              textAlign: "center",
            }}
            tw="grow mt-0 py-8 px-18 mx-4 shadow-lg rounded-md text-center"
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
              {roundToDecimalPlaces(totalStakedBeaconChainEth)}
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

async function getDashboardData() {
  const rEth = RocketTokenRETH__factory.connect(RETH_ADDRESS, provider);
  const rEthRate = Number(await rEth.getExchangeRate()) / 1e18;

  const cbEth = StakedTokenV1__factory.connect(CBETH_ADDRESS, provider);
  const cbEthRate = Number(await cbEth.exchangeRate()) / 1e18;

  const stEthStrategy = StrategyBaseTVLLimits__factory.connect(
    STETH_STRATEGY_ADDRESS,
    provider
  );
  const rEthStrategy = StrategyBaseTVLLimits__factory.connect(
    RETH_STRATEGY_ADDRESS,
    provider
  );
  const cbEthStrategy = StrategyBaseTVLLimits__factory.connect(
    CBETH_STRATEGY_ADDRESS,
    provider
  );

  const stEthTvl =
    Number(
      await stEthStrategy.sharesToUnderlyingView(
        await stEthStrategy.totalShares()
      )
    ) / 1e18;
  const rEthTvl =
    Number(
      await rEthStrategy.sharesToUnderlyingView(
        await rEthStrategy.totalShares()
      )
    ) / 1e18;
  const cbEthTvl =
    Number(
      await cbEthStrategy.sharesToUnderlyingView(
        await cbEthStrategy.totalShares()
      )
    ) / 1e18;

  const totalStakedBeaconResponse = await axios.get(
    `${process.env.NEXT_PUBLIC_SPICE_PROXY_API_URL}/totalStakedBeconChainEth`
  );

  const totalStakedBeaconChainEth =
    totalStakedBeaconResponse.data[0].final_balance;

  return {
    stEthTvl,
    rEthTvl,
    cbEthTvl,
    totalStakedBeaconChainEth,
  };
}
