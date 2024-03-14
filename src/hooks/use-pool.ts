import { getPoolPDAs } from "@/utils";
import { useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";

export const usePool = (token0: string, token1: string) => {
  const { connection } = useConnection();
  return useQuery({
    queryKey: ["pool-state", token0, token1],
    queryFn: async () => {
      let pdas = [getPoolPDAs(token0, token1), getPoolPDAs(token1, token0)];
      const accounts = await connection.getMultipleAccountsInfo(
        pdas.map((pda) => pda.poolState)
      );

      if (accounts[0] !== null) {
        return pdas[0];
      } else if (accounts[1] !== null) {
        return pdas[1];
      } else {
        return null;
      }
    },
    enabled: !!token0 && !!token1,
  });
};
