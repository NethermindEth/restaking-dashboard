
export function getEtherscanAddressUrl(address: string): string {
  return `https://etherscan.io/address/${address}`;
}

export function getShortenedAddress(
  address: string,
  first: number,
  second: number
) {
  return `${address?.slice(0, first)}...${address.slice(-1 * second)}`;
}
