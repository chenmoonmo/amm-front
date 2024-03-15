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
import { formatAmount } from "@/utils/format";

export const useSwap = () => {
  const client = useQueryClient();
  2;
  const program = useDexProgram();
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const [tokenInAmount, setTokenInAmount] = useState("");
  const [tokenOutAmount, setTokenOutAmount] = useState("");
  const [lastInput, setLastInput] = useState(0); // 0: tokenIn, 1: tokenOut

  const [token0, setToken0] = useState("");
  const [token1, setToken1] = useState("");
  const [direction, setDirection] = useState(0); // 0: token0 -> token1, 1: token1 -> token0

  const { data: poolInfo } = usePoolInfo(token0, token1);

  const [tokenIn, tokenOut, setTokenIn, setTokenOut] = useMemo(() => {
    if (direction === 0) {
      return [token0, token1, setToken0, setToken1];
    } else {
      return [token1, token0, setToken1, setToken0];
    }
  }, [direction, token0, token1]);

  const { data: tokenInInfo } = useBalance(tokenIn);
  const { data: tokenOutInfo } = useBalance(tokenOut);

  const handleTokenInAmountChange = (amount: string) => {
    setTokenInAmount(amount);
    setLastInput(0);

    if (poolInfo) {
      const { token0Amount, token1Amount, token0 } = poolInfo;
      const [currentInDecimals, currentOutDecimals] = token0.equals(
        new web3.PublicKey(tokenIn)
      )
        ? [tokenInInfo?.decimals, tokenOutInfo?.decimals]
        : [tokenOutInfo?.decimals, tokenInInfo?.decimals];

      let x = BigInt(token0Amount * 10 ** 18);
      let y = BigInt(token1Amount * 10 ** 18);
      let k = x * y;

      let a = BigInt(+formatAmount(amount, currentInDecimals) * 10 ** 18);

      const newTokenOutAmount = token0.equals(new web3.PublicKey(tokenIn))
        ? y - k / (x + a)
        : x - k / (y + a);

      setTokenOutAmount(
        formatAmount(Number(newTokenOutAmount) / 10 ** 18, currentOutDecimals)
      );
    }
  };

  const handleTokenOutAmountChange = (amount: string) => {
    setTokenOutAmount(amount);
    setLastInput(1);

    if (poolInfo) {
      const { token0Amount, token1Amount, token0 } = poolInfo;
      const [currentInDecimals, currentOutDecimals] = token0.equals(
        new web3.PublicKey(tokenIn)
      )
        ? [tokenInInfo?.decimals, tokenOutInfo?.decimals]
        : [tokenOutInfo?.decimals, tokenInInfo?.decimals];

      let x = BigInt(token0Amount * 10 ** 18);
      let y = BigInt(token1Amount * 10 ** 18);
      let k = x * y;
      let a = BigInt(+formatAmount(amount, currentOutDecimals) * 10 ** 18);
      // 用户支付的 token0 数量  K/(total_Token0-Y1) - total_Token1

      // tokenin === token 0, tokenout === token 1,tokenin === token 0
      // tokenin === token 1,tokenout ===token0, tokenin ===token1

      const newTokenInAmout = token0.equals(new web3.PublicKey(tokenIn))
        ? k / (y - a) - x
        : k / (x - a) - y;

      setTokenInAmount(
        formatAmount(Number(newTokenInAmout) / 10 ** 18, currentInDecimals)
      );
    }
  };

  const price = useMemo(() => {
    if (!poolInfo) return null;
    if (tokenOutAmount && tokenInAmount) {
      const { token0Amount, token1Amount, token0 } = poolInfo;
      if (token0.equals(new web3.PublicKey(tokenIn))) {
        let x1 = token0Amount + +tokenInAmount;
        let y1 = token1Amount - +tokenOutAmount;
        return x1 / y1;
      } else {
        let x1 = token1Amount + +tokenInAmount;
        let y1 = token0Amount - +tokenOutAmount;
        return x1 / y1;
      }
    } else {
      return null;
    }
  }, [poolInfo, tokenIn, tokenInAmount, tokenOutAmount]);

  const { mutateAsync: handleSwap } = useMutation({
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

      console.log(tokenInAmount, tokenOutAmount, tokenInInfo, tokenOutInfo);
      console.log(
        new BN(+tokenInAmount * 10 ** tokenInInfo?.decimals!).toString(),
        new BN(+tokenOutAmount * 10 ** tokenOutInfo?.decimals!).toString()
      );

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
      const latestBlockhash = await connection.getLatestBlockhash();
      let signature: web3.TransactionSignature = "";

      try {
        signature = await sendTransaction(transaction, connection);
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
          queryKey: ["pool-info", poolInfo?.pdas?.poolState],
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

  const handleSwitch = () => {
    setDirection((prev) => (prev === 0 ? 1 : 0));
    if (!poolInfo) return;
    const [newIn, newOut] = [tokenOut, tokenIn];
    const { token0Amount, token1Amount, token0 } = poolInfo!;
    let x = BigInt(token0Amount * 10 ** 18);
    let y = BigInt(token1Amount * 10 ** 18);
    const k = x * y;

    if (lastInput === 0) {
      // tokenoutamount = tokeninamoout
      let a = BigInt(+tokenInAmount * 10 ** 18);
      setTokenOutAmount(tokenInAmount);

      const newTokenInAmout = token0.equals(new web3.PublicKey(newIn))
        ? k / (y - a) - x
        : k / (x - a) - y;

      setTokenInAmount((Number(newTokenInAmout) / 10 ** 18).toString());
    } else {
      // tokeninamount = tokenoutamount

      let a = BigInt(+tokenOutAmount * 10 ** 18);

      setTokenInAmount(tokenOutAmount);

      const newTokenOutAmount = token0.equals(new web3.PublicKey(tokenIn))
        ? y - k / (x + a)
        : x - k / (y + a);

      setTokenOutAmount((Number(newTokenOutAmount) / 10 ** 18).toString());
    }
  };

  const handleTokenInChange = (token: string) => {
    if (token === tokenOut) {
      handleSwitch();
    } else {
      setTokenIn(token);
    }
  };

  const handleTokenOutChange = (token: string) => {
    if (token === tokenIn) {
      handleSwitch();
    } else {
      setTokenOut(token);
    }
  };

  return {
    tokenIn,
    tokenOut,
    setTokenIn: handleTokenInChange,
    setTokenOut: handleTokenOutChange,
    poolInfo,
    price,
    tokenInAmount,
    tokenOutAmount,
    tokenInInfo,
    tokenOutInfo,
    setTokenInAmount: handleTokenInAmountChange,
    setTokenOutAmount: handleTokenOutAmountChange,
    swap: handleSwap,
    switchToken: handleSwitch,
  };
};
