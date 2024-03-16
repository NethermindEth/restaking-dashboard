import { Contract, formatEther } from 'ethers';
import { tryGetTokenSymbol, tokenAddressMap } from '../helpers.js';
import abi from '../abi/renzo/RestakeManager.json' with { type: 'json' };

export default async function (context) {
  if (!context) {
    throw new Error('`context` parameter not provided');
  }

  const restakeManager = new Contract(
    '0x74a09653A083691711cF8215a6ab074BB4e99ef5',
    abi,
    context.ethProvider
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
    const symbol =
      tokenAddressMap[tokens[i]] ||
      (await tryGetTokenSymbol(tokens[i], context.ethProvider));

    data[symbol] = formatEther(odTVLs[i]);
    tokenSum += odTVLs[i];
  }

  data.ETH = formatEther(tvls[2] - tokenSum);

  return data;
}
