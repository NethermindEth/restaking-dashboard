import { Contract, formatEther } from 'ethers';
import { assetMap } from './constants.js';
import configABI from './abi/kelp/ILRTConfig.json' with { type: 'json' };
import depositABI from './abi/kelp/ILRTDepositPool.json' with { type: 'json' };

export default async function (fastify) {
  if (!fastify) {
    throw new Error('`fastify` parameter not provided');
  }

  const config = new Contract(
    '0x947Cb49334e6571ccBFEF1f1f1178d8469D65ec7',
    configABI,
    fastify.ethProvider
  );
  const depositPool = new Contract(
    '0x036676389e48133B63a802f8635AD39E752D375D',
    depositABI,
    fastify.ethProvider
  );

  const addresses = await config.getSupportedAssetList();

  // No performance penalty for map/for..of below
  // as the number of addresses is small
  const results = await Promise.allSettled(
    addresses.map(a => getDistributionData(a, depositPool))
  );
  const data = {};

  for (let r of results) {
    if (r.status === 'fulfilled') {
      // TODO ensure token address is mapped to symbol
      data[assetMap[r.value.asset]] = r.value.value;
    } else {
      fastify.log.error(r.reason);
    }
  }

  const store = fastify.lrtStore();

  await store.put('kelp', Date.now(), data);
}

async function getDistributionData(asset, depositPool) {
  const distribution = await depositPool.getAssetDistributionData(asset);

  return {
    asset,
    value: formatEther(
      distribution.reduce((accumulator, current) => accumulator + current)
    )
  };
}
