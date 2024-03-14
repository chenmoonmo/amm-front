import { BN } from "@coral-xyz/anchor";

export const fomtDecimal = (value: string | number, decimal: number) => {
  return new BN(Math.round(+value * 10 ** decimal));
};