import { BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

interface ParsedTokenData {
  account: {
    data: {
      parsed: {
        info: {
          isNative: boolean;
          mint: string;
          owner: string;
          state: string;
          tokenAmount: {
            amount: string;
            decimals: number;
            uiAmount: number;
            uiAmountString: string;
          };
        };
        type: string;
      };
      program: string;
      space: number;
    };
    executable: boolean;
    lamports: number;
    owner: PublicKey;
    rentEpoch?: number;
  };
  pubkey: PublicKey;
}

export interface IAccountsBalance {
  balance: number;
  balanceLamports: BN;
  hasBalance: boolean;
  decimals: number;
  ata: PublicKey;
}

export const useBalances = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ["balances", publicKey],
    queryFn: async () => {
      if (!connection || !publicKey) return;
      const response = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID },
        "confirmed"
      );

      const reducedResult = response.value.reduce(
        (acc, item: ParsedTokenData) => {
          acc[item.account.data.parsed.info.mint] = {
            balance: item.account.data.parsed.info.tokenAmount.uiAmount,
            balanceLamports: new BN(0),
            hasBalance: item.account.data.parsed.info.tokenAmount.uiAmount > 0,
            decimals: item.account.data.parsed.info.tokenAmount.decimals,
            ata: item.pubkey,
          };
          return acc;
        },
        {} as Record<string, IAccountsBalance>
      );

      return reducedResult;
    },
    enabled: !!publicKey && !!connection,
  });
};
