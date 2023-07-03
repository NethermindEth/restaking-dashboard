
/**
 * Checks whether two addresses are equal in a case-insensitive way.
 * This does not check whether they are valid addresses or not.
 * @param addr1 Address 1.
 * @param addr2 Address 2.
 * @returns Whether they are equal or not.
 */
export function addressEq(addr1: string, addr2: string) {
  return addr1.toLowerCase() === addr2.toLowerCase();
}

/**
 * Formats an address to the PostgreSQL bytea hex format.
 * This does not check whether they are valid addresses or not.
 * @param addr1 Address.
 * @returns PostgreSQL bytea-compatible hex string.
 */
export function addressToPsqlHexString(addr: string) {
  return `\\x${addr.slice(2).toLowerCase()}`;
}
