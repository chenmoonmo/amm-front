import { useQuery } from "@tanstack/react-query";
import { useDexProgram } from "./use-dex-program";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getPoolPDAs, getTokenInfos } from "@/utils";
import { useBalances } from "./use-balances";
import { PublicKey } from "@solana/web3.js";
import { useMemo } from "react";

export type Liquidity = {
  userToken0: number;
  userToken1: number;
  share: number;
  token0: string;
  token1: string;
  token0Symbol?: string;
  token1Symbol?: string;
  poolName: string;
  pdas: ReturnType<typeof getPoolPDAs>;
  userLPBalance: number;
  lpAmount: number;
};

export const useLiquidities = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const program = useDexProgram();
  const { data: balances } = useBalances();

  const { data: liquidities } = useQuery({
    queryKey: ["liquidity", publicKey],
    queryFn: async () => {
      const pools = await program.account.poolState.all();
      const promises = pools.map(async (item) => {
        const { mint0, mint1, totalAmountMinted } = item.account;

        const pdas = getPoolPDAs(mint0.toBase58(), mint1.toBase58());

        const { vault0, vault1 } = pdas;

        const lpAmount = totalAmountMinted / 10 ** 9;

        const [token0Balance, token1Balance] = (
          await Promise.all(
            [vault0, vault1].map((item) =>
              connection.getTokenAccountBalance(item)
            )
          )
        ).map((item) => item.value);

        const [token0Info, token1Info] = await getTokenInfos(
          [mint0, mint1],
          connection
        );

        return {
          token0: mint0.toBase58(),
          token1: mint1.toBase58(),
          token0Symbol: token0Info?.symbol,
          token1Symbol: token1Info?.symbol,
          poolName: `${token0Info?.symbol}/${token1Info?.symbol}`,
          pdas,
          lpAmount,
          token0Amount: token0Balance.uiAmount!,
          token1Amount: token1Balance.uiAmount!,
        };
      });

      const res = await Promise.all(promises);
      return res.filter((item) => item !== null);
    },
    enabled: !!publicKey && !!program,
  });

  const myLiquidities = useMemo(() => {
    return liquidities
      ?.map((item) => {
        const { token0Amount, token1Amount, ...rest } = item;
        const { poolMint } = item.pdas;
        const userLPBalance = balances?.[poolMint.toBase58()]?.balance ?? 0;
        const share = userLPBalance / rest.lpAmount;
        const userToken0 = share * token0Amount;
        const userToken1 = share * token1Amount;
        return { ...rest, userLPBalance, share, userToken0, userToken1 };
      })
      .filter((item) => item.userLPBalance > 0);
  }, [balances, liquidities]);

  return {
    data: myLiquidities,
  };
};
