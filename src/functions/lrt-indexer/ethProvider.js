import { JsonRpcProvider } from 'ethers';

export const ethProvider = new JsonRpcProvider(
  process.env.NM_ETH_RPC_PROVIDER,
  'mainnet'
);
