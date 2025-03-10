"use client";

import { useScreenWidth } from "@/hooks/useScreenWidth";
import ChatPageMobileView from "./is-mobile-view";
import ChatPageDesktopView from "./is-desktop-view";

export default function ChatPage() {
  const screenWidth = useScreenWidth();
  return (
    <>{screenWidth < 1024 ? <ChatPageMobileView /> : <ChatPageDesktopView />}</>
  );
}
