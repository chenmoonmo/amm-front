import { useQuery } from "@tanstack/react-query";
import { useDexProgram } from "./use-dex-program";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { getPoolPDAs, getTokenInfo } from "@/utils";

export const useLiquidities = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const program = useDexProgram();

  return useQuery({
    queryKey: ["liquidity", publicKey],
    queryFn: async () => {
      const pools = await program.account.poolState.all();
      const promises = pools.map(async (item) => {
        const { mint0, mint1, totalAmountMinted } = item.account;
        const pdas = getPoolPDAs(mint0.toBase58(), mint1.toBase58());

        const { vault0, vault1, poolMint } = pdas;

        const poolMintATA = await token.getAssociatedTokenAddress(
          poolMint,
          publicKey!
        );

        const poolMintInfo = await connection.getAccountInfo(poolMintATA);

        if (!poolMintInfo) {
          return null;
        }

        const lpBalance = totalAmountMinted / 10 ** 9;
        const { value: userLpBalance } =
          await connection.getTokenAccountBalance(poolMintATA);
        const { value: token0Balance } =
          await connection.getTokenAccountBalance(vault0);

        const { value: token1Balance } =
          await connection.getTokenAccountBalance(vault1);

        const share = userLpBalance.uiAmount! / lpBalance;

        const userToken0 = share * token0Balance.uiAmount!;
        const userToken1 = share * token1Balance.uiAmount!;

        const token0Info = await getTokenInfo(
          mint0.toBase58(),
          connection,
          publicKey
        );
        const token1Info = await getTokenInfo(
          mint1.toBase58(),
          connection,
          publicKey
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
    enabled: !!publicKey && !!program,
  });
};
