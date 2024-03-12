import fp from 'fastify-plugin';
import { JsonRpcProvider } from 'ethers';

export default fp(async fastify => {
  let provider;

  fastify.decorate(
    'ethProvider',
    (provider ||= new JsonRpcProvider('https://rpc.ankr.com/eth', 'mainnet')) // TODO: use env var for URL
  );
});
