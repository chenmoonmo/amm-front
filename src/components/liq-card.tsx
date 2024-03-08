import { Button, Card, Heading } from "@radix-ui/themes";
import { FC } from "react";

type LiqCardProps = {};

export const LiqCard: FC<LiqCardProps> = () => {
  return (
    <Card size="3" className="w-[450px] mt-6">
      <Heading size="2" weight="medium">
        SOL/USDC
      </Heading>
      <div className="flex justify-between mt-3">
        <div>SOL</div>
        <div>1.2</div>
      </div>
      <div className="flex justify-between">
        <div>USDC</div>
        <div>1.2</div>
      </div>
      <div className="flex justify-between">
        <div>Share of pool</div>
        <div>0.1%</div>
      </div>
      <Button size="3" className="w-full !mt-4">Remove</Button>
    </Card>
  );
};
