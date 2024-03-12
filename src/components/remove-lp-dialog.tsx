"use client";
import { Button, Dialog, Heading, Slider } from "@radix-ui/themes";
import { FC, ReactNode, useMemo, useState } from "react";
import classnames from "classnames";
import { useRemoveLiq } from "@/hooks/use-remove-liq";
import { formatAmount } from "@/utils/format";

export const RemoveLpDialog: FC<{
  children: ReactNode;
  token0: string;
  token1: string;
}> = ({ children, token0, token1 }) => {
  const [open, setOpen] = useState(false);
  const [removeLp, setRemoveLp] = useState(50);

  const { poolInfo, removeLiq } = useRemoveLiq(token0, token1);

  const [token0Receive, token1Receive] = useMemo(() => {
    if (!poolInfo) return ["-", "-"];

    const { token0Amount, token1Amount, userLPBalance, lpAmount } = poolInfo;
    const removePercent = (lpAmount / userLPBalance) * (removeLp / 100);
    const token0Receive = removePercent * token0Amount;
    const token1Receive = removePercent * token1Amount;

    return [token0Receive, token1Receive];
  }, [poolInfo, removeLp]);

  const removeLPNumber = useMemo(() => {
    if (!poolInfo) return 0;
    return (removeLp / 100) * poolInfo.lpAmount;
  }, [poolInfo, removeLp]);

  const enabled = useMemo(
    () => poolInfo && removeLPNumber > 0,
    [poolInfo, removeLPNumber]
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>{children}</Dialog.Trigger>
      <Dialog.Content
        style={{
          width: 420,
        }}
      >
        <Heading size="3" className="!mb-6">
          Remove Liquidity
        </Heading>
        <div className="flex justify-between w-full">
          <div className="font-medium">Pool</div>
          <div>{poolInfo?.poolName}</div>
        </div>
        <div className="font-medium mt-1">Remove Amount</div>
        <div className="bg-[#2C2F38] p-3 rounded-lg mt-4">
          <div className="flex items-center justify-between">
            <div className="text-3xl font-semibold font-mono">{removeLp}%</div>
            <div className="flex gap-2">
              {new Array(4).fill(0).map((_, i) => (
                <div
                  key={i}
                  className={classnames(
                    "py-1 px-3 bg-[#464A56] text-[#828792] rounded-full cursor-pointer",
                    {
                      "!bg-[#0083FF] !text-white": removeLp === (i + 1) * 25,
                    }
                  )}
                  onClick={() => setRemoveLp((i + 1) * 25)}
                >
                  {(i + 1) * 25}%
                </div>
              ))}
            </div>
          </div>
          <Slider
            value={[removeLp]}
            step={1}
            onValueChange={([val]) => setRemoveLp(val)}
            className="mt-5"
          />
        </div>
        <div className="font-medium mt-1">Receive</div>
        <div className="bg-[#2C2F38] p-3 rounded-lg mt-4">
          <div className="flex justify-between w-full">
            <div className="font-medium">{poolInfo?.token0Symbol}</div>
            <div>{formatAmount(token0Receive)}</div>
          </div>
          <div className="flex justify-between w-full">
            <div className="font-medium">{poolInfo?.token1Symbol}</div>
            <div>{formatAmount(token1Receive)}</div>
          </div>
        </div>
        <Button
          disabled={!enabled}
          size="3"
          className="w-full !mt-6"
          onClick={() => removeLiq(removeLPNumber)}
        >
          Confirm
        </Button>
      </Dialog.Content>
    </Dialog.Root>
  );
};
