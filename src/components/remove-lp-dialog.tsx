"use client";
import { Button, Dialog, Heading, Slider } from "@radix-ui/themes";
import { ReactNode, memo, useMemo, useState } from "react";
import classnames from "classnames";
import { useRemoveLiq } from "@/hooks/use-remove-liq";
import { formatAmount } from "@/utils/format";
import { Liquidity } from "@/hooks/use-liquidities";

export const RemoveLpDialog = memo(
  ({ children, data }: { children: ReactNode; data: Liquidity }) => {
    const [open, setOpen] = useState(false);
    const [removeLp, setRemoveLp] = useState(50);

    const { removeLiq } = useRemoveLiq({
      token0: data.token0,
      token1: data.token1,
      onSuccess: () => setOpen(false),
    });

    const [token0Receive, token1Receive] = useMemo(() => {
      const { userToken0, userToken1 } = data;
      return [userToken0, userToken1].map(
        (amount) => (removeLp * amount) / 100
      );
    }, [data, removeLp]);

    const removeLPNumber = useMemo(() => {
      const { lpAmount } = data;

      return (removeLp / 100) * lpAmount;
    }, [data, removeLp]);

    const enabled = useMemo(() => removeLPNumber > 0, [removeLPNumber]);

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
            <div>{data?.poolName}</div>
          </div>
          <div className="font-medium mt-1">Remove Amount</div>
          <div className="bg-[#2C2F38] p-3 rounded-lg mt-4">
            <div className="flex items-center justify-between">
              <div className="text-3xl font-semibold font-mono">
                {removeLp}%
              </div>
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
              <div className="font-medium">{data?.token0Symbol}</div>
              <div>{formatAmount(token0Receive)}</div>
            </div>
            <div className="flex justify-between w-full">
              <div className="font-medium">{data?.token1Symbol}</div>
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
  }
);

RemoveLpDialog.displayName = "RemoveLpDialog";
