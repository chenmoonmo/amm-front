import { Button, Card, Heading } from "@radix-ui/themes";
import { FC } from "react";
import { useLiquidities } from "@/hooks/use-liquidities";
import { RemoveLpDialog } from "./remove-lp-dialog";

type LiqCardProps<T = ReturnType<typeof useLiquidities>["data"]> = {
  data: T extends (infer U)[] ? U : T;
};

export const LiqCard: FC<LiqCardProps> = ({ data }) => {
  return (
    <Card size="3" className="w-[450px] mt-6">
      <Heading size="2" weight="medium">
        {data?.poolName}
      </Heading>
      <div className="flex justify-between mt-3">
        <div>{data?.token0Symbol}</div>
        <div>{data?.userToken0}</div>
      </div>
      <div className="flex justify-between">
        <div>{data?.token1Symbol}</div>
        <div>{data?.userToken1}</div>
      </div>
      <div className="flex justify-between">
        <div>Share of pool</div>
        <div>{data?.share! * 100}%</div>
      </div>
      <RemoveLpDialog
        token0={data?.token0.toBase58()!}
        token1={data?.token1.toBase58()!}
      >
        <Button size="3" className="w-full !mt-4">
          Remove
        </Button>
      </RemoveLpDialog>
    </Card>
  );
};
