import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, MessageSquare, MoreHorizontal, Ban, UserCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { queryKeys } from "@/lib/query-keys";
import { CreateDirectChatSection } from "./create-direct-chat-section";
import { useChatStore } from "@/store/chat-store";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

interface UserListProps {
  onUserSelect: (user: any) => void;
}

export function UserList({ onUserSelect }: UserListProps) {
  const { data: session } = useSession();
  const { setSelectedUser, setSelectedRoom } = useChatStore();
  const queryClient = useQueryClient();
  const [userToBlock, setUserToBlock] = useState<any>(null);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);

  // Fetch all users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: queryKeys.users.all,
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
  });

  // Fetch direct chats (friends)
  const { data: directChats = [], isLoading: isLoadingChats } = useQuery({
    queryKey: queryKeys.directChats.all,
    queryFn: async () => {
      const response = await fetch('/api/direct-chats');
      if (!response.ok) {
        throw new Error('Failed to fetch direct chats');
      }
      return response.json();
    },
  });

  // Fetch unread message counts
  const { data: unreadCounts = {}, isLoading: isLoadingUnread } = useQuery({
    queryKey: queryKeys.directMessages.unreadCounts,
    queryFn: async () => {
      const response = await fetch('/api/direct-messages/unread');
      if (!response.ok) {
        throw new Error('Failed to fetch unread counts');
      }
      return response.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Fetch blocked users
  const { data: blockedUsers = [], isLoading: isLoadingBlocked } = useQuery({
    queryKey: queryKeys.blocks.all,
    queryFn: async () => {
      const response = await fetch('/api/blocks');
      if (!response.ok) {
        throw new Error('Failed to fetch blocked users');
      }
      return response.json();
    },
  });

  // Block user mutation
  const blockUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedUserId: userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to block user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.blocks.all,
      });
      toast.success(`Blocked ${userToBlock.username}`);
      setIsBlockDialogOpen(false);
      setUserToBlock(null);
    },
    onError: () => {
      toast.error("Failed to block user");
    },
  });

  // Unblock user mutation
  const unblockUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/blocks/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to unblock user");
      }

      return response.json();
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.blocks.all,
      });
      
      // Find the user that was unblocked
      const user = directChats.find((chat: any) => chat.friendId._id === userId)?.friendId;
      if (user) {
        toast.success(`Unblocked ${user.username}`);
      } else {
        toast.success("User unblocked");
      }
    },
    onError: () => {
      toast.error("Failed to unblock user");
    },
  });

  const isLoading = isLoadingUsers || isLoadingChats || isLoadingUnread || isLoadingBlocked;

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading users...</div>;
  }

  // Extract friend IDs for easier lookup
  const friendIds = directChats.map((chat: any) => chat.friendId._id);
  
  // Create a map of blocked user IDs for easy lookup
  const blockedUserIds = blockedUsers.reduce((acc: Record<string, boolean>, block: any) => {
    acc[block.blockedUserId._id] = true;
    return acc;
  }, {});

  const handleUserSelect = (user: any, isDirect = false) => {
    // Update the selected user in the store
    setSelectedUser(user);
    
    // Clear any selected room when selecting a user for direct messaging
    setSelectedRoom(null);
    
    // Call the parent component's onUserSelect handler
    onUserSelect(user);
  };

  const handleBlockUser = (user: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    setUserToBlock(user);
    setIsBlockDialogOpen(true);
  };

  const handleUnblockUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    unblockUserMutation.mutate(userId);
  };

  const confirmBlockUser = () => {
    if (userToBlock) {
      blockUserMutation.mutate(userToBlock._id);
    }
  };

  return (
    <div className="space-y-4 h-fit">
      <CreateDirectChatSection />
      
      {/* Friends section */}
      {friendIds.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Direct Messages</h3>
          <div className="space-y-2">
            {directChats.map((chat: any) => {
              const unreadCount = unreadCounts[chat.friendId._id] || 0;
              const isBlocked = blockedUserIds[chat.friendId._id];
              
              return (
                <div
                  key={chat._id}
                  onClick={() => handleUserSelect(chat.friendId, true)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                        {chat.friendId.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                    </div>
                    <div>
                      <div className="font-medium text-sm flex items-center gap-1">
                        {chat.friendId.username}
                        {isBlocked && (
                          <span className="text-xs text-red-500 flex items-center">
                            <Ban className="h-3 w-3 ml-1" />
                            Blocked
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Direct Message
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {/* Unread message count badge */}
                    {unreadCount > 0 && (
                      <div className="bg-red-500 text-white text-xs font-medium rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}
                    
                    {/* Block/Unblock dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isBlocked ? (
                          <DropdownMenuItem onClick={(e) => handleUnblockUser(chat.friendId._id, e as any)}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Unblock {chat.friendId.username}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={(e) => handleBlockUser(chat.friendId, e as any)}>
                            <Ban className="h-4 w-4 mr-2" />
                            Block {chat.friendId.username}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Blocked users section */}
      {blockedUsers.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-red-500 mb-2 flex items-center">
            <Ban className="h-4 w-4 mr-1" />
            Blocked Users
          </h3>
          <div className="space-y-2">
            {blockedUsers.map((block: any) => (
              <div
                key={block._id}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {block.blockedUserId.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-sm flex items-center">
                      {block.blockedUserId.username}
                      {/* <span className="text-xs text-red-500 flex items-center ml-2">
                        <Ban className="h-3 w-3 mr-1" />
                        Blocked
                      </span> */}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(block.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => handleUnblockUser(block.blockedUserId._id, e as any)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Unblock
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Other users section - commented out as in original code */}
      
      {/* Block user confirmation dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block {userToBlock?.username}?</DialogTitle>
            <DialogDescription>
              They won't be able to message you, and you won't see their messages.
              You can unblock them later if you change your mind.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmBlockUser}
              disabled={blockUserMutation.isPending}
            >
              Block User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}