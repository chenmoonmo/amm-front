import { TokenSelector } from "@/components/token-selector";
import { Button, Card } from "@radix-ui/themes";

export default function Home() {
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
            />
          </div>
          <div className="flex-shrink-0">
            <div className="text-right text-sm mb-1">
              <span>balance:0</span>
              <span>Max</span>
            </div>
            <TokenSelector />
          </div>
        </label>
        <label className="flex justify-between bg-[#2C2F38] p-4 rounded-lg mt-2">
          <div>
            <div className="text-xs text-secondary">You pay</div>
            <input
              type="text"
              placeholder="0.0"
              className="bg-transparent outline-none text-2xl font-mono font-semibold"
            />
          </div>
          <div className="flex-shrink-0">
            <div className="text-right text-sm mb-1">
              <span>balance:0</span>
              <span>Max</span>
            </div>
            <TokenSelector />
          </div>
        </label>
        <div className="text-sm bg-[#2C2F38] mt-4 py-2 px-3 rounded-md">
          1 SOL = 1.2 USDC
        </div>
        <Button size="4" className="w-full !mt-4">
          Swap
        </Button>
      </Card>
    </main>
  );
}
