import { getPoolPDAs } from "@/utils";
import { useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";

export const usePool = (token0: string, token1: string) => {
  const { connection } = useConnection();
  return useQuery({
    queryKey: ["pool-state", token0, token1],
    queryFn: async () => {
      let pdas = getPoolPDAs(token0, token1);
      // if pair of token0- token1 exists, account will not be null
      const account = await connection.getAccountInfo(pdas.poolState);

      if (account !== null) {
        // if token0-token1 does not exist, try token1-token0
        return pdas;
      } else {
        let pdas = getPoolPDAs(token1, token0);
        // if pair of token0- token1 exists, account will not be null
        const account = await connection.getAccountInfo(pdas.poolState);
        if (account !== null) {
          return pdas;
        }
      }
      return null;
    },
  });
};
