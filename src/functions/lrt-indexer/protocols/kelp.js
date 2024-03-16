import { Contract, formatEther } from 'ethers';
import { tryGetTokenSymbol, tokenAddressMap } from '../helpers.js';
import configABI from '../abi/kelp/ILRTConfig.json' with { type: 'json' };
import depositABI from '../abi/kelp/ILRTDepositPool.json' with { type: 'json' };

export default async function (context) {
  if (!context) {
    throw new Error('`context` parameter not provided');
  }

  const config = new Contract(
    '0x947Cb49334e6571ccBFEF1f1f1178d8469D65ec7',
    configABI,
    context.ethProvider
  );
  const depositPool = new Contract(
    '0x036676389e48133B63a802f8635AD39E752D375D',
    depositABI,
    context.ethProvider
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
      const symbol =
        tokenAddressMap[r.value.asset] ||
        (await tryGetTokenSymbol(r.value.asset, context.ethProvider));

      data[symbol] = r.value.value;
    } else {
      context.log.error(r.reason);
    }
  }

  return data;
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
