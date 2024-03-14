"use client";
import { MyLiquidity } from "./my-liquidity";
import { AddLiquidity } from "./add-liquidity";
import { Heading } from "@radix-ui/themes";

export default function Home() {
  return (
    <main className="w-full flex flex-col items-center mt-20">
      <Heading size="4" weight="bold">
        Liquidity
      </Heading>
      <AddLiquidity />
      <Heading size="4" weight="bold" className="!mt-5">
        Your Liquidity
      </Heading>
      <MyLiquidity />
    </main>
  );
}
