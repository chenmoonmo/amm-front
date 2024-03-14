import { Button, Card, Heading } from "@radix-ui/themes";
import { memo } from "react";
import { Liquidity } from "@/hooks/use-liquidities";
import { RemoveLpDialog } from "./remove-lp-dialog";
import { foramtPrecent, formatAmount } from "@/utils/format";

type LiqCardProps = {
  data: Liquidity;
};

export const LiqCard = memo(({ data }: LiqCardProps) => {
  return (
    <Card size="3" className="w-[450px] mt-6">
      <Heading size="2" weight="medium">
        {data?.poolName}
      </Heading>
      <div className="flex justify-between mt-3">
        <div>{data?.token0Symbol}</div>
        <div>{formatAmount(data?.userToken0)}</div>
      </div>
      <div className="flex justify-between">
        <div>{data?.token1Symbol}</div>
        <div>{formatAmount(data?.userToken1)}</div>
      </div>
      <div className="flex justify-between">
        <div>Share of pool</div>
        <div>{foramtPrecent(data?.share! * 100)}%</div>
      </div>
      <RemoveLpDialog data={data}>
        <Button size="3" className="w-full !mt-4">
          Remove
        </Button>
      </RemoveLpDialog>
    </Card>
  );
});

LiqCard.displayName = "LiqCard";
