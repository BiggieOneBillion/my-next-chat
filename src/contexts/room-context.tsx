import { createContext, useContext, ReactNode } from 'react';
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchRooms, inviteUser, deleteRoom, updateRoom, leaveRoom } from "@/lib/api/rooms";
import { queryKeys } from "@/lib/query-keys";
import { socket } from "@/lib/socket-client";
import { sendMessage } from "@/lib/api/messages";
import { toast } from "sonner";
import { Room } from "@/components/room-list";

interface RoomContextType {
  rooms: Room[];
  isLoading: boolean;
  handleLeaveRoom: (roomId: string) => Promise<void>;
  handleInviteUser: (roomId: string, email: string) => Promise<void>;
  handleDeleteRoom: (roomId: string) => Promise<void>;
  handleEditRoom: (roomId: string, newName: string) => Promise<void>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: queryKeys.rooms.all,
    queryFn: fetchRooms,
  });

  const leaveMutation = useMutation({
    mutationFn: leaveRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: ({ roomId, email }: { roomId: string; email: string }) =>
      inviteUser(roomId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ roomId, name }: { roomId: string; name: string }) =>
      updateRoom(roomId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
    },
  });

  const handleLeaveRoom = async (roomId: string) => {
    try {
      await leaveMutation.mutateAsync(roomId);
      socket.emit("user-left", {
        roomId,
        username: session?.user?.name || "A user",
        removedBy: "self",
      });
      await sendMessage(
        roomId,
        `${session?.user?.name || "A user"} left the room`,
        "system"
      );
      toast.success("Left room successfully");
    } catch (error) {
      toast.error("Failed to leave room");
    }
  };

  const handleInviteUser = async (roomId: string, email: string) => {
    try {
      await inviteMutation.mutateAsync({ roomId, email });
    } catch (error) {
      toast.error(`Failed to invite user: ${(error as Error).message}`);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await deleteMutation.mutateAsync(roomId);
    } catch (error) {
      toast.error("Failed to delete room");
    }
  };

  const handleEditRoom = async (roomId: string, newName: string) => {
    try {
      await updateMutation.mutateAsync({ roomId, name: newName });
    } catch (error) {
      toast.error("Failed to update room");
    }
  };

  return (
    <RoomContext.Provider
      value={{
        rooms,
        isLoading,
        handleLeaveRoom,
        handleInviteUser,
        handleDeleteRoom,
        handleEditRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};