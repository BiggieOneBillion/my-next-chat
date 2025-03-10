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
import { UserPlus } from "lucide-react";
import { Room } from "@/components/room-list";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { inviteUser } from "@/lib/api/rooms";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { socket } from "@/lib/socket-client";
import { sendMessage } from "@/lib/api/messages";
import { Checkbox } from "../ui/checkbox";
import { useRoom } from "@/contexts/room-context";

interface InviteUserDialogProps {
  room: Room;
}

export function InviteUserDialog({room}:InviteUserDialogProps) {

  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMultipleInvite, setIsMultipleInvite] = useState(false); //  state for managing multiple invite

  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Please fill in the email field");
      return;
    }
    setIsLoading(true);
    try {
      await inviteUser(room._id, email);
      socket.emit("inviteUser", { roomId: room._id, email });
      await sendMessage(
        room._id,
        `${email} was added to the room by admin`,
        "system"
      );
      if (!isMultipleInvite) {
        queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
        queryClient.invalidateQueries({
          queryKey: queryKeys.rooms.messages(room._id),
        });
      }
      toast.success("User Invited");
      !isMultipleInvite && setIsOpen(false);
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        if ((error as any).status === 404) {
          toast.error(
            "User not found. Please check if the email is registered."
          );
        } else if ((error as any).status === 500) {
          toast.error("Server error. Please try again later.");
        } else if (!navigator.onLine || error.message.includes("fetch")) {
          toast.error("Network error. Please check your internet connection.");
        } else if (error.message.includes("already")) {
          toast.error("User is already a member of this room.");
        } else {
          toast.error(`${error.message}`);
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      // alert("You are leaving the room-111");

      if (isMultipleInvite) {
        console.log("You are leaving the room");
        queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
        queryClient.invalidateQueries({
          queryKey: queryKeys.rooms.messages(room._id),
        });
      }
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to {room.name}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="user@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={isMultipleInvite}
              onCheckedChange={() => setIsMultipleInvite(!isMultipleInvite)}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              click to send multiple invites
            </label>
          </div>
          <Button type="button" onClick={handleSubmit} className="w-full">
            {isLoading ? "sending..." : "Send Invitation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
