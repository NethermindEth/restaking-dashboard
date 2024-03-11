import { ethers } from 'ethers';
import configABI from './abi/kelp/ILRTConfig.json' with { type: 'json' };
import depositABI from './abi/kelp/ILRTDepositPool.json' with { type: 'json' };

export default async function (provider, logger) {
  if (!provider) {
    throw new Error('JSON-RPC Provider is required');
  }

  const config = new ethers.Contract(
    '0x947Cb49334e6571ccBFEF1f1f1178d8469D65ec7',
    configABI,
    provider
  );

  const addresses = await config.getSupportedAssetList();

  // No performance penalty for map/for..of below
  // as the number of addresses is small
  const results = await Promise.allSettled(
    addresses.map(a => getDistributionData(a, provider))
  );
  const data = {};

  for (let r of results) {
    if (r.status === 'fulfilled') {
      // TODO ensure token address is mapped to symbol
      data[assetSymbols[r.value.asset]] = r.value.value;
    } else {
      logger.error(r.reason);
    }
  }

  return data;
}

async function getDistributionData(asset, provider) {
  const depositPool = new ethers.Contract(
    '0x036676389e48133B63a802f8635AD39E752D375D',
    depositABI,
    provider
  );
  const distribution = await depositPool.getAssetDistributionData(asset);

  return {
    asset,
    value: ethers.formatEther(
      distribution.reduce((accumulator, current) => accumulator + current)
    )
  };
}

const assetSymbols = Object.freeze({
  '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84': 'stETH',
  '0xA35b1B31Ce002FBF2058D22F30f95D405200A15b': 'ETHx',
  '0xac3E018457B222d93114458476f3E3416Abbe38F': 'sfrxETH',
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': 'ETH'
});
