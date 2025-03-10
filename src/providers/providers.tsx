"use client";
import { SessionProvider } from "next-auth/react";
import React, { ReactNode } from "react";
import QueryProvider from "./query-provider";
import { RoomProvider } from "@/contexts/room-context";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <QueryProvider>
      <SessionProvider>
        <RoomProvider>{children}</RoomProvider>
      </SessionProvider>
    </QueryProvider>
  );
};

export default Providers;
