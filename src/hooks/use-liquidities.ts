import { useQuery } from "@tanstack/react-query";
import { useDexProgram } from "./use-dex-program";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";

export const useLiquidities = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const program = useDexProgram();

  return useQuery({
    queryKey: ["liquidity", publicKey],
    queryFn: async () => {
      const programID = program.programId;
      const pools = await program.account.poolState.all();
      const promises = pools.map(async (item) => {
        const { mint0, mint1, totalAmountMinted } = item.account;
        const poolState = item.publicKey;

        let [vault0, vault0_b] = await web3.PublicKey.findProgramAddressSync(
          [Buffer.from("vault0"), poolState.toBuffer()],
          programID
        );
        let [vault1, vault1_b] = await web3.PublicKey.findProgramAddressSync(
          [Buffer.from("vault1"), poolState.toBuffer()],
          programID
        );
        let [poolMint, poolMint_b] =
          await web3.PublicKey.findProgramAddressSync(
            [Buffer.from("pool_mint"), poolState.toBuffer()],
            programID
          );

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

        //  TODO: 暴露池子信息
        return {
          userToken0,
          userToken1,
          share,
        };
      });

      const res = await Promise.all(promises);
      return res.filter((item) => item !== null);
    },
    enabled: !!publicKey && !!program,
  });
};
