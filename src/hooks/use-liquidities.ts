import { useQuery } from "@tanstack/react-query";
import { useDexProgram } from "./use-dex-program";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getPoolPDAs, getTokenInfos } from "@/utils";
import { useBalances } from "./use-balances";
import { PublicKey } from "@solana/web3.js";

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

  return useQuery({
    queryKey: ["liquidity", publicKey],
    queryFn: async () => {
      const pools = await program.account.poolState.all();
      const promises = pools.map(async (item) => {
        const { mint0, mint1, totalAmountMinted } = item.account;

        const pdas = getPoolPDAs(mint0.toBase58(), mint1.toBase58());

        const { vault0, vault1, poolMint } = pdas;

        const userLPBalance = balances?.[poolMint.toBase58()]?.balance ?? 0;

        if (userLPBalance === 0) {
          return null;
        }

        const lpAmount = totalAmountMinted / 10 ** 9;

        const [token0Balance, token1Balance] = (
          await Promise.all(
            [vault0, vault1].map((item) =>
              connection.getTokenAccountBalance(item)
            )
          )
        ).map((item) => item.value);

        const share = userLPBalance / lpAmount;

        const userToken0 = share * token0Balance.uiAmount!;
        const userToken1 = share * token1Balance.uiAmount!;

        const [token0Info, token1Info] = await getTokenInfos(
          [mint0, mint1],
          connection
        );

        let data: Liquidity = {
          userToken0,
          userToken1,
          share,
          token0: mint0.toBase58(),
          token1: mint1.toBase58(),
          token0Symbol: token0Info?.symbol,
          token1Symbol: token1Info?.symbol,
          poolName: `${token0Info?.symbol}/${token1Info?.symbol}`,
          pdas,
          userLPBalance,
          lpAmount,
        };

        return data;
      });

      const res = await Promise.all(promises);
      return res.filter((item) => item !== null);
    },
    enabled: !!publicKey && !!program && !!balances,
  });
};
