import { Contract, formatEther } from 'ethers';
import abi from '../abi/puffer/IERC4626.json' with { type: 'json' };

export default async function (context) {
  if (!context) {
    throw new Error('`context` parameter not provided');
  }

  const vault = new Contract(
    '0xD9A442856C234a39a81a089C06451EBAa4306a72',
    abi,
    context.ethProvider
  );
  const eth = await vault.totalAssets(/*{ blockTag: 19391517 }*/);

  return { ETH: formatEther(eth) };
}
