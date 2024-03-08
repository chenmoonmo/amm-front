import { useMutation, useQuery } from "@tanstack/react-query";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { useAnchorProvider } from "@/components/solana-provider";
import { getPoolPDAs } from "@/utils";
import { usePoolInfo } from "./use-pool-info";
import { useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useBalance } from "./use-balance";
import { useDexProgram } from "./use-dex-program";
import { BN } from "@coral-xyz/anchor";

export const useAddLiq = () => {
  const provider = useAnchorProvider();
  const { connection } = useConnection();
  const { sendTransaction, signTransaction, publicKey } = useWallet();
  const program = useDexProgram();

  const [token0, setToken0] = useState("");
  const [token1, setToken1] = useState("");

  const [token0Amount, setToken0Amount] = useState("");
  const [token1Amount, setToken1Amount] = useState("");

  const { data: token0Info } = useBalance(token0);
  const { data: token1Info } = useBalance(token1);

  const { data: poolInfo } = usePoolInfo(token0, token1);
  // if poolInfo is null then the pool does not exist
  const isPoolInitialized = useMemo(() => poolInfo !== null, [poolInfo]);

  const shareOfPool = useMemo(() => {
    if (!isPoolInitialized) return 1;

    let percent =+token0Amount / (poolInfo?.token0Amount.uiAmount! + +token0Amount);

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
      setToken1Amount(
        // y
        (
          (BigInt(amount) * BigInt(token1Amount.uiAmount!)) /
          BigInt(token0Amount.uiAmount!)
        ).toString()
      );
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
      setToken0Amount(
        //x
        (
          (BigInt(amount) * BigInt(token0Amount.uiAmount!)) /
          BigInt(token1Amount.uiAmount!)
        ).toString()
      );
    }
  };

  const handleInitPool = async () => {
    const transaction = new web3.Transaction();

    const { poolState, authority, vault0, vault1, poolMint } =
      await getPoolPDAs(token0, token1);

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
    const poolMintATAInfo = await provider.connection.getAccountInfo(
      poolMintATA
    );

    if (!poolMintATAInfo) {
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

    const addLiquidityInstruction = await program.methods
      .addLiquidity(
        // TODO: BN and decimal
        new BN(+token0Amount * 10 ** token0Info?.decimals!),
        new BN(+token1Amount * 10 ** token1Info?.decimals!)
      )
      .accounts({
        poolState,
        poolAuthority: authority,
        vault0,
        vault1,
        poolMint,
        user0: token0Info?.ataAddress!,
        user1: token1Info?.ataAddress!,
        userPoolAta: poolMintATA,
        owner: publicKey!,
        tokenProgram: token.TOKEN_PROGRAM_ID,
      })
      .instruction();

    transaction.add(addLiquidityInstruction);

    await sendTransaction(transaction, connection);
  };

  return {
    poolInfo,
    token0,
    setToken0,
    token1,
    setToken1,
    token0Amount,
    setToken0Amount: handleToken0AmountChange,
    token1Amount,
    setToken1Amount: handleToken1AmountChange,
    token0Info,
    token1Info,
    shareOfPool,
    initPool: handleInitPool,
  };
};
