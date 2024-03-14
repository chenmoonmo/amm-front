import { LiqCard } from "@/components/liq-card";
import { useLiquidities } from "@/hooks/use-liquidities";
import { Heading } from "@radix-ui/themes";
import { memo } from "react";

export const MyLiquidity = memo(() => {
  const { data: myLiquidities } = useLiquidities();

  const filtedLiquidities = myLiquidities?.filter((l) => l !== null);

  console.log(filtedLiquidities);

  return (
    <>
      {filtedLiquidities?.map((item) => {
        return <LiqCard key={item?.poolName} data={item!} />;
      })}
    </>
  );
});

MyLiquidity.displayName = "MyLiquidity";
