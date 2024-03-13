import { useQuery } from "@tanstack/react-query";
import { useDexProgram } from "./use-dex-program";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getPoolPDAs, getTokenInfos } from "@/utils";
import { useBalances } from "./use-balances";

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

        const userLpBalance = balances?.[poolMint.toBase58()]?.balance ?? 0;

        if (userLpBalance === 0) {
          return null;
        }

        const lpBalance = totalAmountMinted / 10 ** 9;

        const [token0Balance, token1Balance] = (
          await Promise.all(
            [vault0, vault1].map((item) =>
              connection.getTokenAccountBalance(item)
            )
          )
        ).map((item) => item.value);

        const share = userLpBalance / lpBalance;

        const userToken0 = share * token0Balance.uiAmount!;
        const userToken1 = share * token1Balance.uiAmount!;

        const [token0Info, token1Info] = await getTokenInfos(
          [mint0, mint1],
          connection
        );

        return {
          userToken0,
          userToken1,
          share,
          token0: mint0,
          token1: mint1,
          token0Symbol: token0Info?.symbol,
          token1Symbol: token1Info?.symbol,
          poolName: `${token0Info?.symbol}/${token1Info?.symbol}`,
          pdas,
        };
      });

      const res = await Promise.all(promises);
      return res.filter((item) => item !== null);
    },
    enabled: !!publicKey && !!program && !!balances,
  });
};
