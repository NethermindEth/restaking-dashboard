import { getNetworkTokens } from "@/app/constants";
import { getProvider } from "@/app/utils";
import { roundToDecimalPlaces } from "@/lib/utils";
import {
  RocketTokenRETH__factory,
  StakedTokenV1__factory,
  StrategyBaseTVLLimits__factory,
} from "@/typechain";
import { ImageResponse } from "@vercel/og";
import axios from "axios";

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
  const dashboardData = await getDashboardData();

  const [
    logoData,
    stEthLogoData,
    rEthLogoData,
    cbEthLogoData,
    beaconEthLogoData,
  ] = await Promise.all([logo, stEthLogo, rEthLogo, cbEthLogo, beaconEthLogo]);

  const network = "eth";

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
          {Object.entries(getNetworkTokens(network).tokens).map(
            ([key, value]) => (
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
                <p tw="text-base mx-auto">Staked {key}</p>
                <p tw="text-xl mx-auto">
                  {" "}
                  {roundToDecimalPlaces(dashboardData[`${key}Tvl`])}
                </p>
              </div>
            )
          )}

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
              {roundToDecimalPlaces(dashboardData.totalStakedBeaconChainEth)}
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
  const networkData = getNetworkTokens(network);

  const provider = getProvider(networkData.url);
  const networkToken = networkData.tokens;

  const rEth = networkToken["rEth"]
    ? RocketTokenRETH__factory.connect(networkToken["rEth"].address, provider)
    : null;

  const rEthRate = rEth ? Number(await rEth.getExchangeRate()) / 1e18 : 0;

  const cbEth = networkToken["cbEth"]
    ? StakedTokenV1__factory.connect(networkToken["cbEth"].address, provider)
    : null;
  const cbEthRate = cbEth ? Number(await cbEth.exchangeRate()) / 1e18 : 0;

  const stEthStrategy = networkToken["stEth"]
    ? StrategyBaseTVLLimits__factory.connect(
        networkToken["stEth"].strategyAddress,
        provider
      )
    : null;
  const rEthStrategy = networkToken["rEth"]
    ? StrategyBaseTVLLimits__factory.connect(
        networkToken["rEth"].strategyAddress,
        provider
      )
    : null;
  const cbEthStrategy = networkToken["cbEth"]
    ? StrategyBaseTVLLimits__factory.connect(
        networkToken["cbEth"].strategyAddress,
        provider
      )
    : null;

  const stEthTvl = stEthStrategy
    ? Number(
        await stEthStrategy.sharesToUnderlyingView(
          await stEthStrategy.totalShares()
        )
      ) / 1e18
    : 0;
  const rEthTvl = rEthStrategy
    ? Number(
        await rEthStrategy.sharesToUnderlyingView(
          await rEthStrategy.totalShares()
        )
      ) / 1e18
    : 0;
  const cbEthTvl = cbEthStrategy
    ? Number(
        await cbEthStrategy.sharesToUnderlyingView(
          await cbEthStrategy.totalShares()
        )
      ) / 1e18
    : 0;

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
