"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, CheckCheck, Send, Shield, Ban, UserX, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket-client";
import { queryKeys } from "@/lib/query-keys";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Message {
  _id: string;
  content: string;
  senderId: {
    _id: string;
    username: string;
  };
  receiverId: {
    _id: string;
    username: string;
  };
  createdAt: string;
  read: boolean;
}

interface DirectMessageChatProps {
  recipientId: string;
  recipientName: string;
}

export function DirectMessageChat({
  recipientId,
  recipientName,
}: DirectMessageChatProps) {
  const { data: session } = useSession();
  const [newMessage, setNewMessage] = useState("");
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch direct messages between current user and recipient
  const {
    data: messages = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.directMessages.conversation(recipientId),
    queryFn: async () => {
      const response = await fetch(`/api/direct-messages/${recipientId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      return response.json();
    },
    enabled: !!recipientId && !!session?.user?.id,
  });

  // Check if user is blocked
  const { data: blockStatus } = useQuery({
    queryKey: queryKeys.blocks.status(recipientId),
    queryFn: async () => {
      const response = await fetch(`/api/blocks/${recipientId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch block status");
      }
      return response.json();
    },
    enabled: !!recipientId && !!session?.user?.id,
  });

  const isBlocked = blockStatus?.isBlocked || false;
  const isBlockedBy = blockStatus?.isBlockedBy || false;

  // Block user mutation
  const blockUserMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedUserId: recipientId }),
      });

      if (!response.ok) {
        throw new Error("Failed to block user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.blocks.status(recipientId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.blocks.all,
      });
      toast.success(`Blocked ${recipientName}`);
      setIsBlockDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to block user");
    },
  });

  // Unblock user mutation
  const unblockUserMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/blocks/${recipientId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to unblock user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.blocks.status(recipientId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.blocks.all,
      });
      toast.success(`Unblocked ${recipientName}`);
    },
    onError: () => {
      toast.error("Failed to unblock user");
    },
  });

  // Send direct message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch("/api/direct-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: recipientId,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.directMessages.conversation(recipientId),
      });
    },
  });

  // Socket connection for real-time messaging
  useEffect(() => {
    if (recipientId && session?.user?.id) {
      // Join direct message channel
      socket.emit("join-direct-chat", {
        userId: session.user.id,
        recipientId,
      });

      // Listen for new direct messages
      socket.on("new-direct-message", (message) => {
        if (
          (message.senderId === session?.user?.id &&
            message.receiverId === recipientId) ||
          (message.senderId === recipientId &&
            message.receiverId === session?.user?.id)
        ) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.directMessages.conversation(recipientId),
          });
        }
      });
    }

    return () => {
      socket.off("new-direct-message");
    };
  }, [recipientId, session?.user?.id, queryClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (recipientId && messages.length > 0) {
        try {
          await fetch(`/api/direct-messages/${recipientId}/read`, {
            method: "POST",
          });
        } catch (error) {
          console.error("Failed to mark messages as read:", error);
        }
      }
    };

    markMessagesAsRead();
  }, [recipientId, messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !recipientId || isBlocked || isBlockedBy) return;

    try {
      // Emit socket event for real-time updates
      socket.emit("send-direct-message", {
        senderId: session?.user?.id,
        receiverId: recipientId,
        content: newMessage,
      });

      await sendMessageMutation.mutateAsync(newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleBlockUser = () => {
    blockUserMutation.mutate();
  };

  const handleUnblockUser = () => {
    unblockUserMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">Loading messages...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">
          Failed to load messages.{" "}
          <button onClick={() => refetch()}>Retry</button>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full md:h-screen">
      {/* Chat header with block option */}
      <div className="p-3 border-b flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
            {recipientName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-medium">{recipientName}</h3>
            {isBlocked && (
              <span className="text-xs text-red-500 flex items-center">
                <Ban className="h-3 w-3 mr-1" />
                Blocked
              </span>
            )}
            {isBlockedBy && (
              <span className="text-xs text-red-500 flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                You are blocked
              </span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
              <span className="sr-only">Open menu</span>
              <UserX className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {isBlocked ? (
              <DropdownMenuItem onClick={handleUnblockUser} className="text-sm py-2">
                <UserCheck className="h-4 w-4 mr-2" />
                Unblock {recipientName}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setIsBlockDialogOpen(true)} className="text-sm py-2 text-red-500">
                <Ban className="h-4 w-4 mr-2" />
                Block {recipientName}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
        {/* {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">
              {isBlocked ? (
                <>
                  You've blocked {recipientName}. Unblock to send messages.
                </>
              ) : isBlockedBy ? (
                <>You've been blocked by this user.</>
              ) : (
                <>
                  No messages yet. Start a conversation with {recipientName}!
                </>
              )}
            </p>
          </div>
        ) : ( */}
        {messages.length > 0 ? (
          messages.map((message: Message) => (
            <div
              key={message._id}
              className={`flex flex-col ${
                message.senderId._id === session?.user?.id
                  ? "items-end"
                  : "items-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.senderId._id === session?.user?.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                <div className="text-sm">{message.content}</div>
                <div className="text-xs w-full text-right mt-1 opacity-70">
                  {format(new Date(message.createdAt), "HH:mm")}
                  {message.senderId._id === session?.user?.id && (
                    <span className="ml-1 inline-flex">
                      {message.read ? (
                        <CheckCheck size={12} />
                      ) : (
                        <Check size={12} />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full w-full flex justify-center items-center">
            No messages yet. Start a conversation with {recipientName}!
          </div>
        )}
        {/* )} */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 sm:p-4 border-t sticky bottom-0 bg-white"
      >
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              isBlocked
                ? "You've blocked this user"
                : isBlockedBy
                ? "You can't message this user"
                : `Message ${recipientName}...`
            }
            className="flex-1"
            disabled={isBlocked || isBlockedBy}
          />
          <Button
            type="submit"
            size="icon"
            disabled={sendMessageMutation.isPending || isBlocked || isBlockedBy}
            className="h-9 w-9 sm:h-10 sm:w-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {(isBlocked || isBlockedBy) && (
          <div className="mt-2 text-xs text-center text-red-500">
            {isBlocked 
              ? `You've blocked ${recipientName}. Unblock to send messages.` 
              : `You can't message ${recipientName} because they've blocked you.`}
          </div>
        )}
      </form>

      {/* Block user confirmation dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[90%] rounded-lg">
          <DialogHeader>
            <DialogTitle>Block {recipientName}?</DialogTitle>
            <DialogDescription>
              They won't be able to message you, and you won't see their
              messages. You can unblock them later if you change your mind.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsBlockDialogOpen(false)}
              className="sm:mr-2 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBlockUser}
              disabled={blockUserMutation.isPending}
              className="w-full sm:w-auto"
            >
              Block User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
