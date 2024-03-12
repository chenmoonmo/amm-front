import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { getPoolPDAs } from "@/utils";
import { usePoolInfo } from "./use-pool-info";
import { useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useBalance } from "./use-balance";
import { useDexProgram } from "./use-dex-program";
import { BN } from "@coral-xyz/anchor";
import toast from "react-hot-toast";

export const useAddLiq = () => {
  const client = useQueryClient();

  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const program = useDexProgram();

  const [token0, setToken0] = useState("");
  const [token1, setToken1] = useState("");

  const [token0Amount, setToken0Amount] = useState("");
  const [token1Amount, setToken1Amount] = useState("");

  const { data: token0Info } = useBalance(token0);
  const { data: token1Info } = useBalance(token1);

  const { data: poolInfo } = usePoolInfo(token0, token1);
  // if poolInfo is null then the pool does not exist
  const isPoolInitialized = useMemo(() => !!poolInfo, [poolInfo]);

  const shareOfPool = useMemo(() => {
    if (!isPoolInitialized) return 1;

    let percent = +token0Amount / (poolInfo?.token0Amount! + +token0Amount);

    return Math.min(percent, 1);
  }, [isPoolInitialized, poolInfo, token0Amount]);

  const handleToken0AmountChange = (amount: string) => {
    setToken0Amount(amount);

    if (amount === "") {
      setToken1Amount("");
      return;
    }

    if (isPoolInitialized) {
      const { token0Amount, token1Amount } = poolInfo!;
      // X / Y = total_TokenA / total_TokenB
      // y = (X * total_TokenB) / total_TokenA
      // x = (Y * total_TokenA) / total_TokenB
      setToken1Amount(((+amount * token1Amount) / token0Amount).toString());
    }
  };

  const handleToken1AmountChange = (amount: string) => {
    setToken1Amount(amount);

    if (amount === "") {
      setToken0Amount("");
      return;
    }

    if (isPoolInitialized) {
      const { token0Amount, token1Amount } = poolInfo!;
      setToken0Amount(((+amount * token0Amount) / token1Amount).toString());
    }
  };

  const handleToken0Change = (token: string) => {
    if (token1 === token) {
      setToken1(token0);
    }
    setToken0(token);
  };

  const handleToken1Change = (token: string) => {
    if (token0 === token) {
      setToken0(token1);
    }
    setToken1(token);
  };

  const { mutateAsync } = useMutation({
    mutationKey: ["addLiquidity", token0, token1],
    mutationFn: async () => {
      const transaction = new web3.Transaction();
      // 从 poolInfo 中获取, 如果不存在则为创建 getPoolPDAs
      const { poolState, authority, vault0, vault1, poolMint } =
        poolInfo?.pdas ?? getPoolPDAs(token0, token1);

      if (!isPoolInitialized) {
        const initPoolInstruction = await program.methods
          .initializePool()
          .accounts({
            mint0: token0,
            mint1: token1,
            poolState,
            poolAuthority: authority,
            vault0,
            vault1,
            poolMint,
            payer: publicKey!,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: token.TOKEN_PROGRAM_ID,
          })
          .instruction();

        transaction.add(initPoolInstruction);
      }

      // user token0 token1 and poolmint ata accounts
      const poolMintATA = await token.getAssociatedTokenAddress(
        poolMint,
        publicKey!
      );

      // is poolmint exist
      const poolMintATAInfo = await connection.getAccountInfo(poolMintATA);

      if (poolMintATAInfo === null) {
        // createAssociatedTokenAccount poolmint account instruction
        const createAssociatedTokenAccountInstruction =
          token.createAssociatedTokenAccountInstruction(
            publicKey!,
            poolMintATA,
            publicKey!,
            poolMint
          );

        transaction.add(createAssociatedTokenAccountInstruction);
      }

      // token0 和 pool token0 是否一致， 否则交换方向 , 只有在池子已经存在的时候才需要交换
      let amounts = [
        new BN(+token0Amount * 10 ** token0Info?.decimals!),
        new BN(+token1Amount * 10 ** token1Info?.decimals!),
      ];
      let userATAs = [token0Info?.ataAddress!, token1Info?.ataAddress!];

      if (
        isPoolInitialized &&
        !poolInfo!.token0.equals(new web3.PublicKey(token0))
      ) {
        amounts = [
          new BN(+token1Amount * 10 ** token1Info?.decimals!),
          new BN(+token0Amount * 10 ** token0Info?.decimals!),
        ];
        userATAs = [token1Info?.ataAddress!, token0Info?.ataAddress!];
      }

      const addLiquidityInstruction = await program.methods
        .addLiquidity(amounts[0], amounts[1])
        .accounts({
          poolState,
          poolAuthority: authority,
          vault0,
          vault1,
          poolMint,
          user0: userATAs[0],
          user1: userATAs[1],
          userPoolAta: poolMintATA,
          owner: publicKey!,
          tokenProgram: token.TOKEN_PROGRAM_ID,
        })
        .instruction();

      transaction.add(addLiquidityInstruction);
      let signature: web3.TransactionSignature = "";

      try {
        const latestBlockhash = await connection.getLatestBlockhash();
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
    token0,
    setToken0: handleToken0Change,
    token1,
    setToken1: handleToken1Change,
    token0Amount,
    setToken0Amount: handleToken0AmountChange,
    token1Amount,
    setToken1Amount: handleToken1AmountChange,
    token0Info,
    token1Info,
    shareOfPool,
    addLiquidity: mutateAsync,
  };
};
