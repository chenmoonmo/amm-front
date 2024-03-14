"use client";
import { TokenSelector } from "@/components/token-selector";
import { useSwap } from "@/hooks/use-swap";
import { formatAmount, formatInput } from "@/utils/format";
import { Button, Card } from "@radix-ui/themes";
import { useEffect, useMemo } from "react";

export default function Home() {
  const {
    tokenIn,
    tokenOut,
    tokenInInfo,
    tokenOutInfo,
    setTokenIn,
    setTokenOut,
    poolInfo,
    tokenInAmount,
    tokenOutAmount,
    setTokenInAmount,
    setTokenOutAmount,
    price,
    swap,
    switchToken,
  } = useSwap();

  const [buttonText, enabled] = useMemo(() => {
    if (+tokenInAmount > (tokenInInfo?.balance ?? 0)) {
      return ["Insufficient balance", false];
    }
    if (!tokenInAmount || !tokenOutAmount) {
      return ["Enter an amount", false];
    }
    if (!poolInfo) {
      return ["No pool found", false];
    }
    return ["Swap", true];
  }, [poolInfo, tokenInAmount, tokenInInfo?.balance, tokenOutAmount]);

  useEffect(() => {
    console.log("poolInfo", poolInfo);
  }, [poolInfo]);

  return (
    <main className="w-full flex flex-col items-center mt-20">
      <Card size="3" className="w-[450px] mt-6">
        <label className="flex justify-between bg-[#2C2F38] p-4 rounded-lg">
          <div>
            <div className="text-xs text-secondary">You pay</div>
            <input
              type="text"
              placeholder="0.0"
              className="bg-transparent outline-none text-2xl font-mono font-semibold"
              value={tokenInAmount}
              onChange={(e) => setTokenInAmount(formatInput(e.target.value))}
            />
          </div>
          <div className="flex-shrink-0 flex flex-col items-end">
            <div className="text-right text-sm mb-1">
              <span>balance: {formatAmount(tokenInInfo?.balance)}</span>
              {/*               
              <span className="ml-1 text-[var(--accent-9)] hover:text-[var(--accent-10)] cursor-pointer">
                Max
              </span> */}
            </div>
            <TokenSelector value={tokenIn} onChange={setTokenIn} />
          </div>
        </label>
        <div
          className="absolute left-1/2 -translate-y-1/4 -translate-x-1/2 flex items-center justify-center z-10 w-8 h-8 bg-[#2d3037] border-2 border-[#1f2127] rounded-md cursor-pointer"
          onClick={switchToken}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.24676 7.24331e-07L5.24676 9.16645L1.0417 4.85911L-2.65949e-07 5.91579L5.9979 12L12 5.9037L10.9679 4.86683L6.70087 9.16376L6.70087 6.6077e-07L5.24676 7.24331e-07Z"
              fill="white"
            />
          </svg>
        </div>
        <label className="flex justify-between bg-[#2C2F38] p-4 rounded-lg mt-2">
          <div>
            <div className="text-xs text-secondary">You receive</div>
            <input
              type="text"
              placeholder="0.0"
              className="bg-transparent outline-none text-2xl font-mono font-semibold"
              value={tokenOutAmount}
              onChange={(e) => setTokenOutAmount(e.target.value)}
            />
          </div>
          <div className="flex-shrink-0 flex flex-col items-end">
            <div className="text-right text-sm mb-1">
              <span>balance: {formatAmount(tokenOutInfo?.balance)}</span>
            </div>
            <TokenSelector value={tokenOut} onChange={setTokenOut} />
          </div>
        </label>
        {price && (
          <div className="text-sm bg-[#2C2F38] mt-4 py-2 px-3 rounded-md">
            1 {tokenOutInfo?.symbol} = {formatAmount(price)}{" "}
            {tokenInInfo?.symbol}
          </div>
        )}
        <Button
          disabled={!enabled}
          size="4"
          className="w-full !mt-4"
          onClick={() => swap()}
        >
          {buttonText}
        </Button>
      </Card>
    </main>
  );
}
