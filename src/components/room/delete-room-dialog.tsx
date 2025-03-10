"use client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash } from "lucide-react";
import { Room } from "@/components/room-list";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRoom } from "@/lib/api/rooms";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";

interface DeleteRoomDialogProps {
  room: Room;
}

export function DeleteRoomDialog({
  room,
}: DeleteRoomDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const handleDeleteRoom = async (roomId: string) => {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(roomId);
    } catch (error) {
      console.error("Failed to delete room:", error);
    }
    setIsDeleting(false);
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
        >
          <Trash className="h-4 w-4 mr-2" />
          Delete Room
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the room "{room.name}" and remove all
            participants. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={() => handleDeleteRoom(room._id)}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
