import { useEffect } from 'react';
import { useServices } from '../@services/ServiceContext';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';
import { formatNumber } from '../utils';

const PROTOCOL_TOKEN_NAME_MAPPING = {
  stEth: 'Lido Staked Ether',
  cbEth: 'Coinbase Staked Ether',
  rEth: 'Rocket Pool Ether',
  wBEth: 'Binance Staked Ether',
  osEth: 'StakeWise Staked Ether',
  swEth: 'Swell Staked Ether',
  ankrEth: 'Ankr Staked Ether',
  ethX: 'Stader Staked Ether',
  oEth: 'Origin Staked Ether',
  sfrxEth: 'Staked Frax Ether',
  lsEth: 'Liquid Staked Ether',
  mEth: 'Mantle Staked Ether'
};

const PROTOCOL_ICON_MAPPING = {
  stEth: new URL('/stEth.svg', import.meta.url).href,
  cbEth: new URL('/cbEth.svg', import.meta.url).href,
  rEth: new URL('/rEth.svg', import.meta.url).href,
  wBEth: new URL('/wBETH.png', import.meta.url).href,
  osEth: new URL('/osEth.svg', import.meta.url).href,
  swEth: new URL('/swEth.svg', import.meta.url).href,
  ankrEth: new URL('/ankrEth.svg', import.meta.url).href,
  ethX: new URL('/ethX.png', import.meta.url).href,
  oEth: new URL('/oEth.svg', import.meta.url).href,
  sfrxEth: new URL('/sfrxEth.svg', import.meta.url).href,
  lsEth: new URL('/lsEth.png', import.meta.url).href,
  mEth: new URL('/mEth.svg', import.meta.url).href
};

export default function LSTList({}) {
  const { lstService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {});

  useEffect(() => {
    async function fetchLST() {
      const data = await lstService.getDeposits();

      const current = data[data.length - 1];

      const protocols = Object.keys(current.deposits).filter(
        protocol => protocol != 'beacon'
      );

      const rankings = [];
      for (const p of protocols) {
        rankings.push({ ...current.deposits[p], token: p });
      }

      rankings.sort((a, b) => {
        if (a.cumulativeAmount < b.cumulativeAmount) {
          return 1;
        }

        if (a.cumulativeAmount > b.cumulativeAmount) {
          return -1;
        }

        return 0;
      });

      dispatch({ lst: data });
      dispatch({ rankings });
    }

    fetchLST();
  }, []);

  return (
    <div>
      <div className="font-display font-medium pb-4 mb-4 text-foreground-1 text-3xl uppercase">
        LST
      </div>
      <div className="bg-content1 border border-outline rounded-lg text-sm">
        <div className="flex flex-row gap-x-2 justify-between items-center p-4 text-foreground-1">
          <div className="min-w-5"></div>
          <div className="min-w-5"></div>
          <span className="basis-full">Protocol</span>
          <span className="basis-1/2">Token</span>
          <span className="basis-1/2 text-end">Amount</span>
        </div>
        <div>
          {state.rankings?.map((protocol, i) => (
            <div
              key={`lst-item-${i}`}
              className="border-t border-outline flex flex-row gap-x-2 justify-between items-center p-4 cursor-pointer hover:bg-default bg-content1"
            >
              <div className="min-w-5">{i + 1}</div>
              <div
                className="bg-center bg-contain bg-no-repeat h-5 rounded-full min-w-5"
                style={{
                  backgroundImage: `url('${PROTOCOL_ICON_MAPPING[protocol.token]}')`
                }}
              ></div>
              <div className="basis-full truncate">
                {PROTOCOL_TOKEN_NAME_MAPPING[protocol.token]}
              </div>
              <div className="basis-1/2">{protocol.token}</div>
              <div className="basis-1/2 text-end">
                <div>ETH {formatNumber(protocol.cumulativeAmount)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
