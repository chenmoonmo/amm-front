import { useQuery } from "@tanstack/react-query";
import { useAnchorProvider } from "@/components/solana-provider";
import { getTokenInfo } from "@/utils";
import { useDexProgram } from "./use-dex-program";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as token from "@solana/spl-token";
import { usePool } from "./use-pool";

export const usePoolInfo = (token0: string, token1: string) => {
  const provider = useAnchorProvider();
  const program = useDexProgram();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { data: pdas } = usePool(token0, token1);

  return useQuery({
    queryKey: ["pool-info", pdas?.poolState],
    queryFn: async () => {
      const { poolState: poolStatePDA, vault0, vault1, poolMint } = pdas!;
      try {
        let poolState = await program.account.poolState.fetch(poolStatePDA);
        const { mint0, mint1, totalAmountMinted } = poolState;

        const vault0Balance = (
          await provider.connection.getTokenAccountBalance(vault0)
        ).value;
        const valut1Balance = (
          await provider.connection.getTokenAccountBalance(vault1)
        ).value;

        const token0Info = await getTokenInfo(
          mint0.toBase58(),
          connection,
          publicKey
        );
        const token1Info = await getTokenInfo(
          mint1.toBase58(),
          connection,
          publicKey
        );

        const userPoolAta = await token.getAssociatedTokenAddress(
          poolMint,
          publicKey!
        );

        const userLPBalance = (
          await connection.getTokenAccountBalance(userPoolAta)
        )?.value.uiAmount;

        return {
          pdas,
          token0: mint0,
          token1: mint1,
          lpAddress: poolMint,
          userLPBalance: userLPBalance ?? 0,
          lpAmount: totalAmountMinted.toNumber() / 10 ** 9,
          token0Amount: vault0Balance.uiAmount ?? 0,
          token1Amount: valut1Balance.uiAmount ?? 0,
          token0Decimals: token0Info?.decimals ?? 9,
          token1Decimals: token1Info?.decimals ?? 9,
          token0Symbol: token0Info?.symbol ?? "",
          token1Symbol: token1Info?.symbol ?? "",
          poolName: `${token0Info?.symbol}/${token1Info?.symbol}`,
          price: valut1Balance.uiAmount! / vault0Balance.uiAmount!,
        };
      } catch (e) {
        // if catched, then pool does not exist
        console.log(e);
        return null;
      }
    },
    enabled: pdas !== null,
  });
};
