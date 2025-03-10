"use client";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { socket } from "@/lib/socket-client";
import { sendMessage } from "@/lib/api/messages";
import { ParticipantItem } from "./participant-item";

interface Participant {
  _id: string;
  username: string;
}

interface ParticipantsListProps {
  participants: Participant[];
  roomId: string;
  isOwner: boolean;
}

export function ParticipantsList({ participants, roomId, isOwner }: ParticipantsListProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const handleRemoveParticipant = async (participantId: string, username: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/participants/${participantId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove participant');
      }

      // Emit socket event for user removal
      socket.emit("user-left", {
        roomId,
        username,
        removedBy: 'admin'
      });

      // Save system message using the correct endpoint
      await sendMessage(
        roomId, 
        `${username} was removed from the room by admin`,
        'system'
      );

      toast.success('Participant removed successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.messages(roomId) });
    } catch (error) {
      toast.error('Failed to remove participant');
    }
  };



  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Participants</h2>
      <div className="space-y-2">
        {participants?.map((participant) => (
          <ParticipantItem
            key={participant._id}
            participant={participant}
            isOwner={isOwner}
            onRemove={handleRemoveParticipant}
          />
        ))}
      </div>
    </div>
  );
}
