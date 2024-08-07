export const BEACON_STRATEGY = '0xbeac0eeeeeeeeeeeeeeeeeeeeeeeeeeeeeebeac0';

export const EIGEN_STRATEGY = '0xacb55c530acdb2849e6d4f36992cd8c9d50ed8f7';

export const lstStrategyAssetMapping = {
  '0x93c4b944d05dfe6df7645a86cd2206016c51564d': {
    symbol: 'stETH',
    name: 'Lido Staked Ether',
    logo: '/images/steth.svg'
  },
  '0x54945180db7943c0ed0fee7edab2bd24620256bc': {
    name: 'Coinbase Staked Ether',
    symbol: 'cbETH',
    logo: '/images/cbeth.png'
  },
  '0x1bee69b7dfffa4e2d53c2a2df135c388ad25dcd2': {
    symbol: 'rETH',
    name: 'Rocket Pool Ether',
    logo: '/images/reth.webp'
  },
  '0x7ca911e83dabf90c90dd3de5411a10f1a6112184': {
    symbol: 'wBETH',
    name: 'Binance Staked Ether',
    logo: '/images/wbeth.png'
  },
  '0x57ba429517c3473b6d34ca9acd56c0e735b94c02': {
    symbol: 'osETH',
    name: 'StakeWise Staked Ether',
    logo: '/images/oseth.svg'
  },
  '0x0fe4f44bee93503346a3ac9ee5a26b130a5796d6': {
    symbol: 'swETH',
    name: 'Swell Staked Ether',
    logo: '/images/sweth.png'
  },
  '0x13760f50a9d7377e4f20cb8cf9e4c26586c658ff': {
    symbol: 'ankrETH',
    name: 'Ankr Staked Ether',
    logo: '/images/ankreth.svg'
  },
  '0x9d7ed45ee2e8fc5482fa2428f15c971e6369011d': {
    symbol: 'ETHx',
    name: 'Stader Staked Ether',
    logo: '/images/ethx.png'
  },
  '0xa4c637e0f704745d182e4d38cab7e7485321d059': {
    symbol: 'oETH',
    name: 'Origin Staked Ether',
    logo: '/images/oeth.svg'
  },
  '0x8ca7a5d6f3acd3a7a8bc468a8cd0fb14b6bd28b6': {
    symbol: 'sfrxETH',
    name: 'Staked Frax Ether',
    logo: '/images/sfrxeth.svg'
  },
  '0xae60d8180437b5c34bb956822ac2710972584473': {
    symbol: 'lsETH',
    name: 'Liquid Staked Ether',
    logo: '/images/lseth.png'
  },
  '0x298afb19a105d59e74658c4c334ff360bade6dd2': {
    symbol: 'mETH',
    name: 'Mantle Staked Ether',
    logo: '/images/meth.svg'
  }
};

export const allStrategyAssetMapping = {
  ...lstStrategyAssetMapping,
  [EIGEN_STRATEGY]: {
    name: 'Eigen',
    symbol: 'EIGEN',
    logo: '/images/eigen.png'
  },
  [BEACON_STRATEGY]: {
    name: 'Beacon',
    symbol: 'ETH',
    logo: '/images/eth.png'
  }
};
