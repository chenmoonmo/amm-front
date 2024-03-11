import { useMemo, useState } from "react";
import { usePoolInfo } from "./use-pool-info";
import { BN } from "@coral-xyz/anchor";
import { useDexProgram } from "./use-dex-program";
import { useBalance } from "./use-balance";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as token from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useSwap = (tokenIn: string, tokenOut: string) => {
  const client = useQueryClient();

  const program = useDexProgram();
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const [tokenInAmount, setTokenInAmount] = useState("");
  const [tokenOutAmount, setTokenOutAmount] = useState("");
  

  const { data: tokenInInfo } = useBalance(tokenIn);
  const { data: tokenOutInfo } = useBalance(tokenOut);

  const { data: poolInfo } = usePoolInfo(tokenIn, tokenOut);

  const handleTokenInAmountChange = (amount: string) => {
    setTokenInAmount(amount);

    if (poolInfo) {
      const { token0Amount, token1Amount, token0 } = poolInfo;

      const k = token0Amount * token1Amount;

      const newTokenOutAmount = token0.equals(new web3.PublicKey(tokenIn))
        ? token0Amount - k / (token1Amount + +amount)
        : token1Amount - k / (token0Amount + +amount);

      setTokenOutAmount(newTokenOutAmount.toString());
    }
  };

  const handleTokenOutAmountChange = (amount: string) => {
    setTokenOutAmount(amount);

    if (poolInfo) {
      // TODO:
      const { token0Amount, token1Amount, token0 } = poolInfo;

      const k = token0Amount * token1Amount;
      // 用户支付的 token0 数量  K/(total_Token0-Y1) - total_Token1

      // tokenin === token 0
      // tokenin === token 1
      const newTokenInAmout = token0.equals(new web3.PublicKey(tokenIn))
        ? k / (token1Amount - +amount) - token0Amount
        : k / (token0Amount - +amount) - token1Amount;

      setTokenInAmount(newTokenInAmout.toString());
    }
  };

  const price = useMemo(() => {
    return +tokenOutAmount / +tokenInAmount;
  }, [tokenInAmount, tokenOutAmount]);

  const { mutateAsync: handleSwap } = useMutation({
    mutationKey: ["swap", tokenIn, tokenOut],
    mutationFn: async () => {
      const { token0 } = poolInfo!;
      const transaction = new web3.Transaction();

      // if tokenout ata is not exist, create a new account
      let tokenOutAccount = await connection.getAccountInfo(
        tokenOutInfo?.ataAddress!
      );

      if (tokenOutAccount === null) {
        const createAssociatedTokenAccountInstruction =
          token.createAssociatedTokenAccountInstruction(
            publicKey!,
            tokenOutInfo?.ataAddress!,
            publicKey!,
            new web3.PublicKey(tokenOut)
          );

        transaction.add(createAssociatedTokenAccountInstruction);
      }

      const { poolState, authority, vault0, vault1 } = poolInfo?.pdas!;

      const [vaultIn, vaultOut] = token0.equals(new web3.PublicKey(tokenIn))
        ? [vault0, vault1]
        : [vault1, vault0];

      let swapInstruction = await program.methods
        .swap(
          new BN(+tokenInAmount * 10 ** tokenInInfo?.decimals!),
          new BN(+tokenOutAmount * 10 ** tokenOutInfo?.decimals!)
        )
        .accounts({
          poolState,
          poolAuthority: authority,
          vaultIn,
          vaultOut,
          owner: publicKey!,
          userIn: tokenInInfo?.ataAddress!,
          userOut: tokenOutInfo?.ataAddress!,
          tokenProgram: token.TOKEN_PROGRAM_ID,
        })
        .instruction();

      transaction.add(swapInstruction);

      await sendTransaction(transaction, connection);
    },
    onSuccess: () => {
      // TODO: success ui
      return Promise.all([
        client.invalidateQueries({
          queryKey: ["pool-info", tokenIn, tokenOut],
        }),
        client.invalidateQueries({
          queryKey: ["tokenInfo", tokenIn, publicKey],
        }),
        client.invalidateQueries({
          queryKey: ["tokenInfo", tokenOut, publicKey],
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

  //  TODO: mutation

  return {
    poolInfo,
    price,
    tokenInAmount,
    tokenOutAmount,
    setTokenInAmount: handleTokenInAmountChange,
    setTokenOutAmount: handleTokenOutAmountChange,
    swap: handleSwap,
  };
};
