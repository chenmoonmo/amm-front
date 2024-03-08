import { useQuery } from "@tanstack/react-query";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { useAnchorProvider } from "@/components/solana-provider";
import { getPoolPDAs } from "@/utils";
import { useDexProgram } from "./use-dex-program";
import { useBalance } from "./use-balance";

type PoolInfo = {
  poolState: web3.PublicKey;
  authority: web3.PublicKey;
  vault0: web3.PublicKey;
  vault1: web3.PublicKey;
  poolMint: web3.PublicKey;
  mint0: web3.PublicKey;
  mint1: web3.PublicKey;
  token0Balance: web3.TokenAmount;
  token1Balance: web3.TokenAmount;
  poolMintBalance: web3.TokenAmount;
};

export const usePoolInfo = (token0: string, token1: string) => {
  const provider = useAnchorProvider();
  const program = useDexProgram();

  const { data: token0Info } = useBalance(token0);
  const { data: token1Info } = useBalance(token1);

  return useQuery({
    queryKey: ["pool-info", token0, token1],
    queryFn: async () => {
      const {
        poolState: poolStatePDA,
        vault0,
        vault1,
        poolMint,
      } = await getPoolPDAs(token0, token1);

      try {
        const poolState = await program.account.poolState.fetch(poolStatePDA);
        const { mint0, mint1, totalAmountMinted } = poolState;
        // if poolstate exists then get pool vaults and pool mint balance

        const vault0Balance = (
          await provider.connection.getTokenAccountBalance(vault0)
        ).value;
        const valut1Balance = (
          await provider.connection.getTokenAccountBalance(vault1)
        ).value;

        return {
          token0: mint0,
          token1: mint1,
          lpAmount: totalAmountMinted,
          token0Amount: vault0Balance,
          token1Amount: valut1Balance,
          token0Info,
          token1Info,
          price: valut1Balance.uiAmount! / vault0Balance.uiAmount!,
        };
      } catch (e) {
        console.log(e);
        return null;
      }
    },
    enabled: !!token0 && !!token1,
  });
};
