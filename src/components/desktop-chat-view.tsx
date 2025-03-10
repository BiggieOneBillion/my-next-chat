"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Users } from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMessages, sendMessage } from "@/lib/api/messages";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket-client";
import { queryKeys } from "@/lib/query-keys";
import { ParticipantsList } from "./participants-list";

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

interface DesktopChatViewProps {
  roomId: string;
  participants: any[];
  isOwner: boolean;
  showParticipants: boolean;
  roomName: string;
  roomDescription: string;
  chatType: "room" | "direct";
}

export function DesktopChatView({ 
  roomId, 
  participants, 
  isOwner, 
  showParticipants,
  roomName,
  roomDescription,
  chatType
}: DesktopChatViewProps) {
  const { data: session } = useSession();
  const [newMessage, setNewMessage] = useState("");
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (roomId) {
      socket.emit("join-room", roomId);
    }

    socket.on("new-message", (message) => {
      queryClient.invalidateQueries({ queryKey: ["messages", roomId] });
    });

    return () => {
      socket.off("new-message");
    };
  }, [roomId, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


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
        <p className="text-black font-medium">...Loading chat messages</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-black font-medium">
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
    <div className={`grid ${showParticipants ? "grid-cols-[1fr,250px]" : "grid-cols-[1fr]"} h-screen`}>
      {/* Chat Messages Section */}
      <div className="flex-1 flex flex-col overflow-hidden border-r">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white z-10 border-b py-3 px-5 flex justify-between items-center">
          <div>
            <p className="text-gray-800 font-medium capitalize">
              {roomName}
            </p>
            <p className="text-sm text-gray-500 capitalize">
              {roomDescription}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              {participants.length} members
            </span>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-4">
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
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className="pt-4 pb-4 px-4 border-t sticky bottom-0 bg-white"
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

      {/* Participants List Section - Only shown for room chats */}
      {showParticipants && (
        <div className="p-4 overflow-y-auto bg-gray-50 border-l border-gray-200">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Participants</h2>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                {participants.length} members
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            <ParticipantsList 
              participants={participants} 
              roomId={roomId} 
              isOwner={isOwner} 
            />
          </div>
        </div>
      )}
    </div>
  );
}