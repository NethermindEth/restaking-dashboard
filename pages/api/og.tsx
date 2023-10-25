import { ImageResponse } from "@vercel/og";

import { queryTotalStakedTokens } from "@/app/components/hooks/useTotalStakedTokens";
import { getNetworkTokens } from "@/app/utils/constants";
import { SupportedToken } from "@/app/utils/types";

export const config = {
  runtime: "edge",
};

async function fetchImage(publicUrl: string) : Promise<ArrayBuffer> {
  const resp = await fetch(
    new URL(
      `../../public${publicUrl.startsWith("/")? "" : "/"}${publicUrl}`,
      import.meta.url
    )
  );

  return await resp.arrayBuffer();
}

export default async function handler() {
  const network = "eth";
  const networkTokenData = getNetworkTokens(network);
  
  const eigenlayerDashboardLogo = await fetchImage("logo.png");

  const tokenLogos = Object.fromEntries(
    await Promise.all(
      Object.entries(networkTokenData).map(
        async ([token, info]): Promise<[SupportedToken, ArrayBuffer]> => {
          return [token as SupportedToken, await fetchImage(info.image)]
        }
      )
    )
  );

  const tvl = await queryTotalStakedTokens(network);

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
              src={eigenlayerDashboardLogo as unknown as string}
            />
            <p tw="text-2xl ml-4">EigenLayer Stats</p>
          </div>
        </div>
        <div
          style={{ display: "flex" }}
          tw="my-8 mx-8 w-screen flex flex-wrap flex-col lg:flex-row lg:flex-nowrap items-stretch justify-around"
        >
          {Object.entries(networkTokenData).map(([token, tokenInfo]) => (
            <div
              className={tokenInfo.color}
              style={{
                display: "flex",
                flexDirection: "column",
                textAlign: "center",
              }}
              tw="grow mt-0 py-8 px-18 mx-4 shadow-lg rounded-md text-center"
              key={tokenInfo.label}
            >
              <img
                tw="mx-auto"
                src={tokenLogos as unknown as string}
                alt="stETH"
                width="48"
                height="48"
              />
              <p tw="text-base mx-auto">Staked {tokenInfo.label}</p>
              <p tw="text-xl mx-auto">
                {tvl[token as SupportedToken] || ""}
              </p>
            </div>
          ))}
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
