export type AnchorDex = {
  version: "0.1.0";
  name: "anchor_dex";
  instructions: [
    {
      name: "initializePool";
      accounts: [
        { name: "mint0"; isMut: false; isSigner: false },
        { name: "mint1"; isMut: false; isSigner: false },
        { name: "poolState"; isMut: true; isSigner: false },
        { name: "poolAuthority"; isMut: false; isSigner: false },
        { name: "vault0"; isMut: true; isSigner: false },
        { name: "vault1"; isMut: true; isSigner: false },
        { name: "poolMint"; isMut: true; isSigner: false },
        { name: "payer"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false },
        { name: "tokenProgram"; isMut: false; isSigner: false }
      ];
      args: [];
    },
    {
      name: "addLiquidity";
      accounts: [
        { name: "poolState"; isMut: true; isSigner: false },
        { name: "poolAuthority"; isMut: true; isSigner: false },
        { name: "vault0"; isMut: true; isSigner: false },
        { name: "vault1"; isMut: true; isSigner: false },
        { name: "poolMint"; isMut: true; isSigner: false },
        { name: "user0"; isMut: true; isSigner: false },
        { name: "user1"; isMut: true; isSigner: false },
        { name: "userPoolAta"; isMut: true; isSigner: false },
        { name: "owner"; isMut: false; isSigner: true },
        { name: "tokenProgram"; isMut: false; isSigner: false }
      ];
      args: [
        { name: "amountLiq0"; type: "u64" },
        { name: "amountLiq1"; type: "u64" }
      ];
    },
    {
      name: "removeLiquidity";
      accounts: [
        { name: "poolState"; isMut: true; isSigner: false },
        { name: "poolAuthority"; isMut: true; isSigner: false },
        { name: "vault0"; isMut: true; isSigner: false },
        { name: "vault1"; isMut: true; isSigner: false },
        { name: "poolMint"; isMut: true; isSigner: false },
        { name: "user0"; isMut: true; isSigner: false },
        { name: "user1"; isMut: true; isSigner: false },
        { name: "userPoolAta"; isMut: true; isSigner: false },
        { name: "owner"; isMut: false; isSigner: true },
        { name: "tokenProgram"; isMut: false; isSigner: false }
      ];
      args: [{ name: "burnAmount"; type: "u64" }];
    },
    {
      name: "swap";
      accounts: [
        { name: "poolState"; isMut: false; isSigner: false },
        { name: "poolAuthority"; isMut: false; isSigner: false },
        { name: "userIn"; isMut: true; isSigner: false },
        { name: "userOut"; isMut: true; isSigner: false },
        { name: "vaultIn"; isMut: true; isSigner: false },
        { name: "vaultOut"; isMut: true; isSigner: false },
        { name: "owner"; isMut: false; isSigner: true },
        { name: "tokenProgram"; isMut: false; isSigner: false }
      ];
      args: [
        { name: "amountIn"; type: "u64" },
        { name: "minAmountOut"; type: "u64" }
      ];
    }
  ];
  accounts: [
    {
      name: "poolState";
      type: {
        kind: "struct";
        fields: [
          { name: "mint0"; type: "publicKey" },
          { name: "mint1"; type: "publicKey" },
          { name: "totalAmountMinted"; type: "u64" }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: "NotEnoughBalance";
      msg: "Src Balance < LP Deposit Amount.";
    },
    {
      code: 6001;
      name: "NoPoolMintOutput";
      msg: "Pool Mint Amount < 0 on LP Deposit";
    },
    { code: 6002; name: "BurnTooMuch"; msg: "Trying to burn too much" },
    { code: 6003; name: "NotEnoughOut"; msg: "Not enough out" }
  ];
};

export const IDL: AnchorDex = {
  version: "0.1.0",
  name: "anchor_dex",
  instructions: [
    {
      name: "initializePool",
      accounts: [
        { name: "mint0", isMut: false, isSigner: false },
        { name: "mint1", isMut: false, isSigner: false },
        { name: "poolState", isMut: true, isSigner: false },
        { name: "poolAuthority", isMut: false, isSigner: false },
        { name: "vault0", isMut: true, isSigner: false },
        { name: "vault1", isMut: true, isSigner: false },
        { name: "poolMint", isMut: true, isSigner: false },
        { name: "payer", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "addLiquidity",
      accounts: [
        { name: "poolState", isMut: true, isSigner: false },
        { name: "poolAuthority", isMut: true, isSigner: false },
        { name: "vault0", isMut: true, isSigner: false },
        { name: "vault1", isMut: true, isSigner: false },
        { name: "poolMint", isMut: true, isSigner: false },
        { name: "user0", isMut: true, isSigner: false },
        { name: "user1", isMut: true, isSigner: false },
        { name: "userPoolAta", isMut: true, isSigner: false },
        { name: "owner", isMut: false, isSigner: true },
        { name: "tokenProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "amountLiq0", type: "u64" },
        { name: "amountLiq1", type: "u64" },
      ],
    },
    {
      name: "removeLiquidity",
      accounts: [
        { name: "poolState", isMut: true, isSigner: false },
        { name: "poolAuthority", isMut: true, isSigner: false },
        { name: "vault0", isMut: true, isSigner: false },
        { name: "vault1", isMut: true, isSigner: false },
        { name: "poolMint", isMut: true, isSigner: false },
        { name: "user0", isMut: true, isSigner: false },
        { name: "user1", isMut: true, isSigner: false },
        { name: "userPoolAta", isMut: true, isSigner: false },
        { name: "owner", isMut: false, isSigner: true },
        { name: "tokenProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "burnAmount", type: "u64" }],
    },
    {
      name: "swap",
      accounts: [
        { name: "poolState", isMut: false, isSigner: false },
        { name: "poolAuthority", isMut: false, isSigner: false },
        { name: "userIn", isMut: true, isSigner: false },
        { name: "userOut", isMut: true, isSigner: false },
        { name: "vaultIn", isMut: true, isSigner: false },
        { name: "vaultOut", isMut: true, isSigner: false },
        { name: "owner", isMut: false, isSigner: true },
        { name: "tokenProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "amountIn", type: "u64" },
        { name: "minAmountOut", type: "u64" },
      ],
    },
  ],
  accounts: [
    {
      name: "poolState",
      type: {
        kind: "struct",
        fields: [
          { name: "mint0", type: "publicKey" },
          { name: "mint1", type: "publicKey" },
          { name: "totalAmountMinted", type: "u64" },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "NotEnoughBalance",
      msg: "Src Balance < LP Deposit Amount.",
    },
    {
      code: 6001,
      name: "NoPoolMintOutput",
      msg: "Pool Mint Amount < 0 on LP Deposit",
    },
    { code: 6002, name: "BurnTooMuch", msg: "Trying to burn too much" },
    { code: 6003, name: "NotEnoughOut", msg: "Not enough out" },
  ],
};
