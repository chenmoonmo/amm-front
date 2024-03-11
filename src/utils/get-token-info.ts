import { Metaplex } from "@metaplex-foundation/js";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { TokenListProvider, TokenInfo } from "@solana/spl-token-registry";

let tokenList: TokenInfo[] = [];

export const getTokenInfo = async (
  address: string,
  connection: web3.Connection,
  user: web3.PublicKey | null
) => {
  let name: string, symbol: string, mintAddress: string;
  let ataAddress: web3.PublicKey | null = null;
  let accountBalance = 0;
  let decimals = 9;
  try {
    // token 2022
    const metaplex = new Metaplex(connection);
    const nftMetadata = await metaplex.nfts().findByMint({
      mintAddress: new web3.PublicKey(address),
    });

    name = nftMetadata.name;
    symbol = nftMetadata.symbol;
    mintAddress = nftMetadata.mint.address.toBase58();
  } catch (error) {
    // old token
    console.error(error);
    if (tokenList.length === 0) {
      const tokenListProvider = new TokenListProvider();
      const tokenListInstance = await tokenListProvider.resolve();
      tokenList = await tokenListInstance.getList();
    }
    const tokenInfo = tokenList.find(
      (token: TokenInfo) => token.address === address
    );

    if (tokenInfo) {
      name = tokenInfo.name;
      symbol = tokenInfo.symbol;
      mintAddress = tokenInfo.address;
    } else {
      return null;
    }
  }

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
