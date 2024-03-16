import { Contract } from 'ethers';
import erc20ABI from './abi/erc20/IERC20Metadata.json' with { type: 'json' };

export const tryGetTokenSymbol = async (address, provider) => {
  const token = new Contract(address, erc20ABI, provider);

  try {
    return await token.symbol();
  } catch (e) {
    return address;
  }
};

export const tokenAddressMap = Object.freeze({
  '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84': 'stETH',
  '0xA35b1B31Ce002FBF2058D22F30f95D405200A15b': 'ETHx',
  '0xac3E018457B222d93114458476f3E3416Abbe38F': 'sfrxETH',
  '0xa2E3356610840701BDf5611a53974510Ae27E2e1': 'wBETH',
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': 'ETH'
});
