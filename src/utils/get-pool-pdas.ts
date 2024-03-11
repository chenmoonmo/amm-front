import * as web3 from "@solana/web3.js";

export const getPoolPDAs = (token0: string, token1: string) => {
  const programID = process.env.NEXT_PUBLIC_PROGRAM_ID as string;

  const [mint0, mint1] = [
    new web3.PublicKey(token0),
    new web3.PublicKey(token1),
  ];

  let [poolState, poolState_b] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("pool_state"), mint0.toBuffer(), mint1.toBuffer()],
    new web3.PublicKey(programID)
  );

  let [authority, authority_b] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("authority"), poolState.toBuffer()],
    new web3.PublicKey(programID)
  );
  let [vault0, vault0_b] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault0"), poolState.toBuffer()],
    new web3.PublicKey(programID)
  );
  let [vault1, vault1_b] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault1"), poolState.toBuffer()],
    new web3.PublicKey(programID)
  );
  let [poolMint, poolMint_b] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("pool_mint"), poolState.toBuffer()],
    new web3.PublicKey(programID)
  );

  return {
    poolState,
    authority,
    vault0,
    vault1,
    poolMint,
  };
};
