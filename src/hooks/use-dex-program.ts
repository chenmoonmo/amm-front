import { useAnchorProvider } from "@/components/solana-provider";
import { Program } from "@coral-xyz/anchor";
import { useMemo } from "react";
import { IDL } from "@/idl/dex-idl";
import * as web3 from "@solana/web3.js";

export const useDexProgram = () => {
  const provider = useAnchorProvider();

  return useMemo(() => {
    return new Program(
      IDL,
      new web3.PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!),
      provider
    )
  }, [provider]);
};
