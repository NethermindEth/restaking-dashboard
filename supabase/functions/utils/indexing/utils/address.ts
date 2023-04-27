
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
