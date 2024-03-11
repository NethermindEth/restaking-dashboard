import { ethers } from 'ethers';
import abi from './abi/renzo/RestakeManager.json' with { type: 'json' };

export default async function (provider) {
  if (!provider) {
    throw new Error('JSON-RPC Provider is required');
  }

  const restakeManager = new ethers.Contract(
    '0x74a09653A083691711cF8215a6ab074BB4e99ef5',
    abi,
    provider
  );
  const tokensLength = await restakeManager.getCollateralTokensLength();
  const [tokens, tvls] = await Promise.all([
    Promise.all(
      Array.from({ length: Number(tokensLength) }, (_, i) =>
        restakeManager.collateralTokens(i)
      )
    ),
    restakeManager.calculateTVLs()
  ]);
  const odTVLs = tvls[1];
  const data = {};
  let tokenSum = 0n;

  for (let i = 0, count = odTVLs.length; i < count; i++) {
    // TODO ensure token address is mapped to symbol
    data[assetSymbols[tokens[i]]] = ethers.formatEther(odTVLs[i]);
    tokenSum += odTVLs[i];
  }

  data.ETH = ethers.formatEther(tvls[2] - tokenSum);

  return data;
}

const assetSymbols = Object.freeze({
  '0xa2E3356610840701BDf5611a53974510Ae27E2e1': 'wBETH',
  '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84': 'stETH'
});
