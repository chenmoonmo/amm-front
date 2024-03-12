"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "./solana-provider";

const Navs = [
  {
    name: "Swap",
    href: "/",
  },
  {
    name: "Liquidity",
    href: "/liquidity",
  },
];

export const Header = () => {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between h-20 px-5">
      <div className="flex items-center">
        <div className="flex items-center gap-[42px]">
          {Navs.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                pathname === item.href ? "text-white" : "text-secondary"
              } font-medium hover:text-white`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
      <WalletButton />
    </header>
  );
};
