import { Contract, formatEther } from 'ethers';
import abi from './abi/renzo/RestakeManager.json' with { type: 'json' };
import { assetMap } from './constants.js';

export default async function (fastify) {
  if (!fastify) {
    throw new Error('`fastify` parameter not provided');
  }

  const restakeManager = new Contract(
    '0x74a09653A083691711cF8215a6ab074BB4e99ef5',
    abi,
    fastify.ethProvider
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
    data[assetMap[tokens[i]]] = formatEther(odTVLs[i]);
    tokenSum += odTVLs[i];
  }

  data.ETH = formatEther(tvls[2] - tokenSum);

  const store = fastify.lrtStore();

  await store.put('renzo', Date.now(), data);
}
