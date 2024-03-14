import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useDexProgram } from "./use-dex-program";
import { usePoolInfo } from "./use-pool-info";
import * as token from "@solana/spl-token";
import { BN, web3 } from "@coral-xyz/anchor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getPoolPDAs } from "@/utils";
import { PublicKey } from "@solana/web3.js";

export const useRemoveLiq = (token0: string, token1: string) => {
  const client = useQueryClient();
  const program = useDexProgram();

  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const { mutateAsync } = useMutation({
    mutationKey: ["removeLiq", token0, token1],
    mutationFn: async (lpAmount: number) => {
      const { poolMint, poolState, authority, vault0, vault1 } = getPoolPDAs(
        token0,
        token1
      );

      const userPoolAta = await token.getAssociatedTokenAddress(
        poolMint,
        publicKey!
      );

      const user0 = await token.getAssociatedTokenAddress(
        new PublicKey(token0),
        publicKey!
      );

      const user1 = await token.getAssociatedTokenAddress(
        new PublicKey(token1),
        publicKey!
      );

      let signature: web3.TransactionSignature = "";

      try {
        const latestBlockhash = await connection.getLatestBlockhash();

        signature = await program.methods
          .removeLiquidity(new BN(lpAmount * 10 ** 9))
          .accounts({
            poolAuthority: authority,
            poolState,
            poolMint,
            vault0,
            vault1,
            userPoolAta,
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
          queryKey: ["balances", publicKey],
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
    removeLiq: mutateAsync,
  };
};
