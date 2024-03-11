import { ethers } from 'ethers';
import abi from './abi/puffer/IERC4626.json' with { type: 'json' };

export default async function (provider) {
  if (!provider) {
    throw new Error('JSON-RPC Provider is required');
  }

  const vault = new ethers.Contract(
    '0xD9A442856C234a39a81a089C06451EBAa4306a72',
    abi,
    provider
  );
  const eth = await vault.totalAssets(/*{ blockTag: 19391517 }*/);

  return { ETH: ethers.formatEther(eth) };
}
