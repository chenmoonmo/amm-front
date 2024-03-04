"use client";
import { FC, ReactNode, useState } from "react";
import { Theme } from "@radix-ui/themes";
import { SolanaProvider } from "@/components/solana-provider";
import { ClusterProvider } from "@/components/cluster-data-access";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

export const Provider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [client] = useState(new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <ReactQueryStreamedHydration>
        <ClusterProvider>
          <SolanaProvider>
            <Theme appearance="dark" accentColor="blue">
              {children}
            </Theme>
          </SolanaProvider>
        </ClusterProvider>
      </ReactQueryStreamedHydration>
    </QueryClientProvider>
  );
};
