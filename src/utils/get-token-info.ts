import { Metaplex } from "@metaplex-foundation/js";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";

export const getTokenInfo = async (
  address: string,
  connection: web3.Connection
) => {
  let name: string, symbol: string, mintAddress: string;

  // token 2022
  const metaplex = new Metaplex(connection);
  const nftMetadata = await metaplex.nfts().findByMint({
    mintAddress: new web3.PublicKey(address),
  });

  name = nftMetadata.name;
  symbol = nftMetadata.symbol;

  return {
    name,
    symbol,
    address,
  };
};

export const getTokenInfos = async (
  mints: web3.PublicKey[],
  connection: web3.Connection
) => {
  const metaplex = new Metaplex(connection);

  const res = await metaplex.nfts().findAllByMintList({
    mints,
  });

  return res.map((item, index) => {
    return {
      name: item?.name,
      symbol: item?.symbol,
      address: mints[index],
    };
  });
};
