import { Metaplex } from "@metaplex-foundation/js";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";

export const getTokenInfo = async (
  address: string,
  connection: web3.Connection,
  user: web3.PublicKey | null
) => {
  let name: string, symbol: string, mintAddress: string;
  let ataAddress: web3.PublicKey | null = null;
  let accountBalance = 0;
  let decimals = 9;

  // token 2022
  const metaplex = new Metaplex(connection);
  const nftMetadata = await metaplex.nfts().findByMint({
    mintAddress: new web3.PublicKey(address),
  });

  name = nftMetadata.name;
  symbol = nftMetadata.symbol;
  mintAddress = nftMetadata.mint.address.toBase58();

  if (user) {
    const tokenAta = await token.getAssociatedTokenAddress(
      new web3.PublicKey(address),
      user
    );

    const balance = await connection.getTokenAccountBalance(tokenAta);

    decimals = balance.value.decimals;
    accountBalance = balance.value.uiAmount!;
    ataAddress = tokenAta;
  }

  return {
    name,
    symbol,
    decimals,
    address: mintAddress,
    balance: accountBalance,
    ataAddress,
  };
};
