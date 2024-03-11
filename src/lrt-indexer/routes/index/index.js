import { ethers } from 'ethers';
import queryEtherfi from './etherfi.js';
import queryKelp from './kelp.js';
import queryPuffer from './puffer.js';
import queryRenzo from './renzo.js';

export default async function (fastify) {
  const provider = new ethers.JsonRpcProvider(
    'https://rpc.ankr.com/eth',
    'mainnet'
  );

  fastify.get('/lrt', async (request, reply) => {
    return {
      renzo: await queryRenzo(provider),
      kelp: await queryKelp(provider, fastify.log),
      etherfi: await queryEtherfi(provider),
      puffer: await queryPuffer(provider)
    };
  });
}
