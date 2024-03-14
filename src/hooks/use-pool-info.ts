import { useQuery } from "@tanstack/react-query";
import { getTokenInfos } from "@/utils";
import { useDexProgram } from "./use-dex-program";
import { useConnection } from "@solana/wallet-adapter-react";
import { usePool } from "./use-pool";
import { useBalances } from "./use-balances";

export const usePoolInfo = (token0: string, token1: string) => {
  const program = useDexProgram();
  const { connection } = useConnection();
  const { data: balances } = useBalances();
  const { data: pdas } = usePool(token0, token1);

  return useQuery({
    queryKey: ["pool-info", pdas?.poolState],
    queryFn: async () => {
      const { poolState: poolStatePDA, vault0, vault1, poolMint } = pdas!;
      let poolState = await program.account.poolState.fetch(poolStatePDA);
      const { mint0, mint1, totalAmountMinted } = poolState;

      const [vault0Balance, valut1Balance] = (
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

      const userLPBalance = balances?.[poolMint.toBase58()]?.balance ?? 0;

      return {
        pdas,
        token0: mint0,
        token1: mint1,
        lpAddress: poolMint,
        userLPBalance: userLPBalance,
        lpAmount: totalAmountMinted.toNumber() / 10 ** 9,
        token0Amount: vault0Balance.uiAmount ?? 0,
        token1Amount: valut1Balance.uiAmount ?? 0,
        token0Symbol: token0Info?.symbol ?? "",
        token1Symbol: token1Info?.symbol ?? "",
        poolName: `${token0Info?.symbol}/${token1Info?.symbol}`,
        price: valut1Balance.uiAmount! / vault0Balance.uiAmount!,
      };
    },
    enabled: pdas !== null,
  });
};
