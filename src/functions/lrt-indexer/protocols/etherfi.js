import { Contract, formatEther } from 'ethers';
import abi from '../abi/etherfi/ILiquidityPool.json' with { type: 'json' };

export default async function (context) {
  if (!context) {
    throw new Error('`context` parameter not provided');
  }

  const liquidityPool = new Contract(
    '0x308861A430be4cce5502d0A12724771Fc6DaF216',
    abi,
    context.ethProvider
  );
  const eth = await liquidityPool.getTotalPooledEther();

  return { ETH: formatEther(eth) };
}
