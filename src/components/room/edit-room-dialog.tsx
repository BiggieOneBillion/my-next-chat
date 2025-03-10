"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Edit } from "lucide-react";
import { Room } from "@/components/room-list";
import { toast } from "sonner";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRoom } from "@/lib/api/rooms";
import { queryKeys } from "@/lib/query-keys";

interface EditRoomDialogProps {
  room: Room;
}

export function EditRoomDialog({ room }: EditRoomDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState(room.name);
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: ({ roomId, name }: { roomId: string; name: string }) =>
      updateRoom(roomId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
    },
  });
  const handleEditRoom = async (roomId: string, newName: string) => {
    try {
      await updateMutation.mutateAsync({ roomId, name: newName });
    } catch (error) {
      console.error("Failed to update room:", error);
    }
  };
  const handleSubmit = async () => {
    if (!newName) {
      toast.error("Group must have a name");
      return;
    }
    setIsUpdating(true);
    try {
      await handleEditRoom(room._id, newName);
      toast.success("Room Updated Successfully");
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      toast.error("Error updating room");
    }
    setIsUpdating(false);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Edit className="h-4 w-4 mr-2" />
          Edit Room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Room</DialogTitle>
        </DialogHeader>
        <form className="space-y-4">
          <Input
            id="name"
            name="name"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button
            disabled={isUpdating}
            type="button"
            className="w-full"
            onClick={handleSubmit}
          >
            {isUpdating ? "...Saving Changes" : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
