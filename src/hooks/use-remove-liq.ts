import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useDexProgram } from "./use-dex-program";
import { usePoolInfo } from "./use-pool-info";
import * as token from "@solana/spl-token";
import { BN, web3 } from "@coral-xyz/anchor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useRemoveLiq = (token0: string, token1: string) => {
  const client = useQueryClient();
  const { publicKey } = useWallet();
  const program = useDexProgram();
  const { connection } = useConnection();

  const { data: poolInfo } = usePoolInfo(token0, token1);

  const { mutateAsync } = useMutation({
    mutationKey: ["removeLiq", token0, token1],
    mutationFn: async (lpAmount: number) => {
      const { pdas } = poolInfo!;

      const poolMintATA = await token.getAssociatedTokenAddress(
        pdas.poolMint,
        publicKey!
      );

      const user0 = await token.getAssociatedTokenAddress(
        poolInfo?.token0!,
        publicKey!
      );

      const user1 = await token.getAssociatedTokenAddress(
        poolInfo?.token1!,
        publicKey!
      );

      let signature: web3.TransactionSignature = "";

      try {
        const latestBlockhash = await connection.getLatestBlockhash();

        signature = await program.methods
          // TODO: 计算移除的 LP 数量
          .removeLiquidity(new BN(lpAmount * 10 ** 9))
          .accounts({
            poolState: pdas.poolState,
            poolAuthority: pdas.authority,
            poolMint: pdas.poolMint,
            vault0: pdas.vault0,
            vault1: pdas.vault1,
            userPoolAta: poolMintATA,
            user0,
            user1,
          })
          .rpc();
        await connection.confirmTransaction(
          { signature, ...latestBlockhash },
          "confirmed"
        );
        console.log(signature);
        return signature;
      } catch (error) {
        console.log("error", `Transaction failed! ${error}`, signature);
        return;
      }
    },
    onSuccess: () => {
      // TODO: success ui
      return Promise.all([
        client.invalidateQueries({
          queryKey: ["pool-info", token0, token1],
        }),
        client.invalidateQueries({
          queryKey: ["tokenInfo", token0, publicKey],
        }),
        client.invalidateQueries({
          queryKey: ["tokenInfo", token1, publicKey],
        }),
        client.invalidateQueries({
          queryKey: ["liquidity", publicKey],
        }),
      ]);
    },
    onError: (error) => {
      toast.error(`Transaction failed! ${error}`);
    },
  });

  return {
    poolInfo,
    removeLiq: mutateAsync,
  };
};
