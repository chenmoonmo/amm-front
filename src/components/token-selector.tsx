"use client";
import { FC, memo, useCallback, useMemo, useState } from "react";
import { Dialog, ScrollArea } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { Avatar } from "./avatar";
import uniq from "lodash/uniq";
import { atom, useAtom } from "jotai";
import { formatAmount } from "@/utils/format";
import { useBalance } from "@/hooks/use-balance";

type TokenSelectProps = {
  value?: string;
  onChange: (value: string) => void;
};

const MotionAvatar = motion(Avatar);

const variants = {
  selected: {
    backgroundColor: "#24272D",
    paddingRight: "10px",
    paddingLeft: "2px",
  },
  unselected: {
    backgroundColor: "#0083FF",
    paddingRight: "10px",
    paddingLeft: "10px",
  },
};

const tokensAddressAtom = atom<string[]>([]);

export const TokenSelector = memo(({ value, onChange }: TokenSelectProps) => {
  const [tokensAddress, setTokensAddress] = useAtom(tokensAddressAtom);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: currentToken } = useBalance(value);

  const filteredTokens = useMemo(
    () =>
      uniq(tokensAddress.concat([search, value!]).filter((i) => !!i)).filter(
        (t) => {
          if (search === "") return true;
          if (!t) return false;
          return (
            t.toLowerCase().includes(search.toLowerCase()) ||
            (value && t.toLowerCase().includes(value.toLowerCase()))
          );
        }
      ),
    [search, tokensAddress, value]
  );

  const handleSelect = useCallback(
    (select: string) => {
      if (value === select) return;
      setOpen(false);
      onChange(select);
      setSearch("");
      setTokensAddress((prev) => {
        if (prev.includes(select)) return prev;
        return [select, ...prev];
      });
    },
    [onChange, setTokensAddress, value]
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <motion.button
          className="flex items-center gap-1 whitespace-nowrap text-sm leading-3 font-semibold text-white bg-[#0083FF] h-8 rounded-full cursor-pointer"
          initial={false}
          variants={variants}
          animate={value ? "selected" : "unselected"}
        >
          {currentToken && (
            <MotionAvatar
              size={24}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-shrink-0"
            />
          )}
          <span>{currentToken ? currentToken.symbol : "Select token"}</span>
          <svg
            width="8"
            height="6"
            viewBox="0 0 8 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask
              id="mask0_1891_705"
              style={{
                maskType: "luminance",
              }}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="8"
              height="6"
            >
              <path d="M8 0H0V5.09093H8V0Z" fill="white" />
            </mask>
            <g mask="url(#mask0_1891_705)">
              <path
                d="M3.96247 5.07919C3.93053 5.07422 3.8987 5.06926 3.86676 5.05934C3.78462 5.0395 3.71172 4.99001 3.65251 4.93047L3.62513 4.9007L0.156019 0.980255C0.0465031 0.856346 -0.00814351 0.717553 0.000982813 0.544031C0.0101091 0.24176 0.256297 -0.00605878 0.520627 0.0187473C0.648284 0.0286697 0.757688 0.0930445 0.84884 0.192269L3.96704 3.72127C3.97616 3.73119 3.98073 3.74111 3.99898 3.76096C4.00811 3.74111 4.01267 3.72623 4.02179 3.7163C5.06119 2.53675 6.10516 1.36203 7.14456 0.182467C7.23114 0.0883253 7.33153 0.0188683 7.44995 0.00398465C7.45452 0.00398465 7.45452 -0.000976562 7.45908 -0.000976562H7.56392C7.56848 -0.000976562 7.57305 0.00398465 7.58217 0.00398465C7.77817 0.0385922 7.93309 0.192148 7.98329 0.41032L8.00154 0.49454V0.613488C7.99698 0.613488 7.99698 0.618449 7.99698 0.623411C7.98329 0.762204 7.92408 0.87619 7.83281 0.970333C7.60488 1.22311 7.38151 1.48085 7.15357 1.73859C6.22814 2.78444 5.29814 3.83017 4.37271 4.88098C4.32263 4.94039 4.26331 4.99001 4.19497 5.01481C4.1312 5.03962 4.06732 5.05946 4.00354 5.07919H3.96247Z"
                fill="white"
              />
            </g>
          </svg>
        </motion.button>
      </Dialog.Trigger>
      <Dialog.Content
        style={{
          width: "420px",
          height: "411.5px",
          padding: "0",
          borderRadius: "24px",
        }}
        className="flex flex-col"
      >
        <div className="pt-[22px] px-5 pb-5 border-b-px border-[#363A45]">
          <div className="text-sm leading-3 font-extrabold text-white">
            Select a token
          </div>
          <label className="flex items-center gap-2 py-3 px-[14px] mt-6 border-px border-[#363A45] rounded-md cursor-text focus-within:border-[#414651] transition-colors">
            <svg
              width="14"
              height="15"
              viewBox="0 0 14 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <mask
                id="mask0_1891_715"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="14"
                height="15"
              >
                <path d="M14 0H0V15H14V0Z" fill="white" />
              </mask>
              <g mask="url(#mask0_1891_715)">
                <path
                  d="M13.7311 13.481L10.6553 10.2883C11.5594 9.16497 12.0524 7.76468 12.0524 6.28185C12.0524 4.61199 11.4247 3.04167 10.2873 1.85859C9.14999 0.675226 7.63749 0.0263672 6.02619 0.0263672C4.41489 0.0263672 2.90478 0.677969 1.76506 1.85859C0.625075 3.0392 0 4.60952 0 6.28185C0 7.95419 0.627717 9.52203 1.76506 10.7051C2.9024 11.8885 4.41991 12.5373 6.02857 12.5373C7.25019 12.5373 8.41659 12.163 9.40731 11.4639L12.5406 14.7165C12.7041 14.8862 12.9205 14.9737 13.1345 14.9737C13.3485 14.9737 13.5649 14.8887 13.7284 14.7165C14.0605 14.3745 14.0605 13.8205 13.7311 13.481ZM8.97668 9.58676C8.94075 9.61418 8.90693 9.64407 8.87575 9.67671L8.84934 9.70413C8.08952 10.3807 7.10356 10.7874 6.02857 10.7874C3.63342 10.7874 1.68554 8.7654 1.68554 6.27911C1.68554 3.79282 3.63342 1.77083 6.02857 1.77083C8.42373 1.77083 10.3716 3.79282 10.3716 6.27911C10.3716 7.58752 9.83292 8.7632 8.97668 9.58676Z"
                  fill="#9699A3"
                />
              </g>
            </svg>
            <input
              type="text"
              name=""
              id=""
              placeholder="Search address"
              className="flex-auto text-sm leading-3 placeholder:text-secondary bg-transparent outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
        <ScrollArea type="scroll" className="flex-1 pt-[10px]">
          {filteredTokens?.map((token) => (
            <TokenItem
              address={token}
              value={value}
              onSelect={handleSelect}
              key={token}
            />
          ))}
        </ScrollArea>
      </Dialog.Content>
    </Dialog.Root>
  );
});

TokenSelector.displayName = "TokenSelector";

export const TokenItem = memo(
  ({
    address,
    value,
    onSelect,
  }: {
    address: string;
    value?: string;
    onSelect: (value: string) => void;
  }) => {
    const { data: token } = useBalance(address);

    if (!token) return null;

    return (
      <div
        key={token?.address}
        data-address={token?.address}
        className="group flex items-center justify-between px-5 py-[6px] cursor-pointer text-secondary hover:text-white"
        onClick={() => onSelect(token?.address!)}
      >
        <div className="flex items-center gap-2">
          <Avatar size={34} className="contrast-50 group-hover:contrast-100" />
          <div className="text-base font-medium">
            <div>{token?.name}</div>
            <div className="text-secondary text-sm">{token?.symbol}</div>
          </div>
        </div>
        <div className="flex items-center gap-[6px] text-sm">
          {formatAmount(token?.balance)}
          {value === token?.address && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="11"
              height="7"
              viewBox="0 0 11 7"
              fill="none"
            >
              <path
                d="M3.92318 7C3.73859 7 3.56305 6.91809 3.44295 6.77554L0.15223 2.87296C-0.0750014 2.60341 -0.0443915 2.1975 0.220946 1.96653C0.486128 1.7354 0.885307 1.76667 1.11269 2.03622L3.98815 5.44621L9.95178 0.158432C10.2151 -0.0749223 10.6144 -0.0473008 10.8441 0.220184C11.0737 0.487827 11.0465 0.893736 10.7832 1.12725L4.33892 6.84157C4.22366 6.94365 4.07608 7 3.92318 7Z"
                fill="#0083FF"
              />
            </svg>
          )}
        </div>
      </div>
    );
  }
);

TokenItem.displayName = "TokenItem";
