"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMessages, sendMessage } from "@/lib/api/messages";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { socket } from "../lib/socket-client";
import { Badge } from "./ui/badge";
import { queryKeys } from "@/lib/query-keys";

interface Message {
  _id: string;
  content: string;
  senderId: {
    _id: string;
    username: string;
  };
  createdAt: string;
  type?: "user" | "system";
}

interface ChatMessagesProps {
  roomId: string;
}

export function ChatMessages({ roomId }: ChatMessagesProps) {
  const { data: session } = useSession();
  const [newMessage, setNewMessage] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    // Join the room
    if (roomId) {
      // Initialize socket connection
      socket.emit("join-room", roomId);
    }

    // Listen for new messages
    socket.on("new-message", (message) => {
      console.log("MESSAGE FROM EVENT", message);
      queryClient.invalidateQueries({ queryKey: ["messages", roomId] });
    });

    // Cleanup on unmount
    return () => {
      socket.off("new-message");
    };
  }, [roomId, queryClient]);

  const {
    data: messages = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.rooms.messages(roomId),
    queryFn: () => fetchMessages(roomId),
    enabled: !!roomId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => sendMessage(roomId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.rooms.messages(roomId),
      });
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId) return;

    const messageData = {
      senderId: session?.user?.name || "Anonymous",
      content: newMessage,
      roomId: roomId,
    };

    try {
      socket.emit("send-message", messageData);
      await sendMessageMutation.mutateAsync(newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-black font-medium ">...Loading chat messages</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-black font-medium ">
          Network Issue. Check your network and try again
        </p>
        <button
          className="px-2 py-1 rounded-sm border"
          onClick={() => refetch()}
        >
          click to retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((message: Message) => (
            <div
              key={message._id}
              className={`flex flex-col ${
                message.type === "system"
                  ? "items-center"
                  : message.senderId._id === session?.user?.id
                  ? "items-end"
                  : "items-start"
              }`}
            >
              <div
                className={`max-w-[70%] min-w-[200px] rounded-lg p-3 ${
                  message.type === "system"
                    ? "bg-gray-200 text-gray-600"
                    : message.senderId._id === session?.user?.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                {message.type !== "system" && (
                  <div className="font-medium text-xs mb-1">
                    {message.senderId._id === session?.user?.id
                      ? "Me"
                      : message.senderId.username}
                  </div>
                )}
                <div className="text-sm">{message.content}</div>
                <div className="text-xs w-full text-right mt-1 opacity-70">
                  {format(new Date(message.createdAt), "HH:mm")}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center">
            <p className="text-sm text-gray-400 font-medium">
              No messages yet? Start by sending a message 😁
            </p>
          </div>
        )}
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="pt-4 pb-0 border-t sticky bottom-0 bg-white"
      >
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={sendMessageMutation.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
