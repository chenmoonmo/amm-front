"use client";
import { LiqCard } from "@/components/liq-card";
import { TokenSelector } from "@/components/token-selector";
import { Button, Card, Heading, Text } from "@radix-ui/themes";
import { useAddLiq } from "@/hooks/use-add-liq";
import { useMemo } from "react";
import { useLiquidities } from "@/hooks/use-liquidities";
import { formatInput, formatAmount, foramtPrecent } from "@/utils/format";

export default function Home() {
  const {
    poolInfo,
    token0,
    token1,
    setToken0,
    setToken1,
    token0Info,
    token1Info,
    token0Amount,
    setToken0Amount,
    token1Amount,
    setToken1Amount,
    shareOfPool,
    addLiquidity,
  } = useAddLiq();

  const { data: myLiquidities } = useLiquidities();

  const token0Symbol = token0Info?.symbol;
  const token1Symbol = token1Info?.symbol;

  const enbaled = useMemo(
    () => !!(token0 && token1 && token0Amount && token1Amount),
    [token0, token0Amount, token1, token1Amount]
  );

  const price = useMemo(() => {
    if (poolInfo) {
      return poolInfo.price;
    } else {
      return +token0Amount / +token1Amount;
    }
  }, [poolInfo, token0Amount, token1Amount]);

  const buttonText = useMemo(() => {
    if (!enbaled) {
      return "Enter an amount";
    }
    if (!poolInfo) {
      return "Create Pool";
    }
    return "Add Liquidity";
  }, [enbaled, poolInfo]);

  return (
    <main className="w-full flex flex-col items-center mt-20">
      <Heading size="4" weight="bold">
        Liquidity
      </Heading>
      <Card size="3" className="w-[450px] mt-6">
        <label className="flex justify-between bg-[#2C2F38] p-4 rounded-lg">
          <input
            type="text"
            placeholder="0.0"
            className="bg-transparent outline-none text-2xl font-mono font-semibold"
            disabled={!token0 || !token1}
            value={token0Amount}
            onChange={(e) => setToken0Amount(formatInput(e.target.value))}
          />
          <div className="flex-shrink-0 flex flex-col items-end">
            <div className="text-right text-sm mb-1">
              balance: {formatAmount(token0Info?.balance)}
            </div>
            <TokenSelector value={token0} onChange={setToken0} />
          </div>
        </label>
        <div className="flex justify-center py-3">+</div>
        <label className="flex justify-between bg-[#2C2F38] p-4 rounded-lg mb-3">
          <input
            type="text"
            placeholder="0.0"
            className="bg-transparent outline-none text-2xl font-mono font-semibold"
            disabled={!token0 || !token1}
            value={token1Amount}
            onChange={(e) => setToken1Amount(formatInput(e.target.value))}
          />
          <div className="flex-shrink-0 flex flex-col items-end">
            <div className="text-right text-sm mb-1">
              balance: {formatAmount(token1Info?.balance)}
            </div>
            <TokenSelector value={token1} onChange={setToken1} />
          </div>
        </label>
        {(enbaled || !!poolInfo) && (
          <>
            <Text size="2" weight="medium">
              Prices and pool share
            </Text>
            <div className="mt-2 mb-6">
              <div className="flex justify-between bg-[#2C2F38] p-4 rounded-lg text-center text-sm">
                <div>
                  <div>{formatAmount(price)}</div>
                  <div className="font-semibold">
                    {token0Symbol} per {token1Symbol}
                  </div>
                </div>
                <div>
                  <div>{formatAmount(1 / price)}</div>
                  <div className="font-semibold">
                    {token1Symbol} per {token0Symbol}
                  </div>
                </div>
                <div>
                  <div>{foramtPrecent(shareOfPool * 100)}%</div>
                  <div className="font-semibold">Share of pool</div>
                </div>
              </div>
            </div>
          </>
        )}

        <Button
          size="4"
          className="w-full"
          onClick={() => addLiquidity()}
          disabled={!enbaled}
        >
          {buttonText}
        </Button>
      </Card>
      <Heading size="4" weight="bold" className="!mt-5">
        Your Liquidity
      </Heading>
      {myLiquidities?.map((item) => {
        return <LiqCard key={item?.poolName} data={item} />;
      })}
    </main>
  );
}
