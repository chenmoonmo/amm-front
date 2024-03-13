import { getTokenInfo } from "@/utils";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { useBalances } from "./use-balances";

export const useBalance = (address?: string) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const { data: balances } = useBalances();

  return useQuery({
    queryKey: ["tokenInfo", address, publicKey],
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const info = await getTokenInfo(address, connection);
      const balance = balances?.[address];

      return {
        ...info,
        balance: balance?.balance ?? 0,
        decimals: balance?.decimals ?? 9,
        ataAddress: balance?.ata,
      };
    },
    enabled: !!address,
  });
};
