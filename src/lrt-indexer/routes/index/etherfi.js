import { Contract, formatEther } from 'ethers';
import abi from './abi/etherfi/ILiquidityPool.json' with { type: 'json' };

export default async function (fastify) {
  if (!fastify) {
    throw new Error('`fastify` parameter not provided');
  }

  const liquidityPool = new Contract(
    '0x308861A430be4cce5502d0A12724771Fc6DaF216',
    abi,
    fastify.ethProvider
  );
  const eth = await liquidityPool.getTotalPooledEther();
  const store = fastify.lrtStore();

  await store.put('etherfi', Date.now(), { ETH: formatEther(eth) });
}
