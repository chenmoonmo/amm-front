import { getTokenInfo } from "@/utils";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";

export const useBalance = (address: string) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ["tokenInfo", address, publicKey],
    queryFn: () => getTokenInfo(address, connection, publicKey),
    enabled: !!address,
  });
};
