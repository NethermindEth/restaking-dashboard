import { ethers } from 'ethers';
import abi from './abi/etherfi/ILiquidityPool.json' with { type: 'json' };

export default async function (provider) {
  if (!provider) {
    throw new Error('JSON-RPC Provider is required');
  }

  const liquidityPool = new ethers.Contract(
    '0x308861A430be4cce5502d0A12724771Fc6DaF216',
    abi,
    provider
  );
  const eth = await liquidityPool.getTotalPooledEther();

  return { ETH: ethers.formatEther(eth) };
}
