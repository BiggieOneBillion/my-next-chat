"use client";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InviteUserDialog } from "./invite-user-dialog";
import { EditRoomDialog } from "./edit-room-dialog";
import { DeleteRoomDialog } from "./delete-room-dialog";
import { Room } from "@/components/room-list";


interface RoomActionsProps {
  room: Room;
}

export function RoomActions({ room }: RoomActionsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-100 group-hover:opacity-100"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <div className="space-y-2">
          <InviteUserDialog room={room} />
          <EditRoomDialog room={room} />
          <DeleteRoomDialog room={room} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
