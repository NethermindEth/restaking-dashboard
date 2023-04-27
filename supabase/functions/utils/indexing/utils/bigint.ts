
export {}

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

// "polyfill" BigInt toJSON
BigInt.prototype.toJSON = function (): string {
  return this.toString();
};
