import { Room } from "@/components/room-list";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MoreVertical } from "lucide-react";
import { useSession } from "next-auth/react";
import { RoomActions } from "./room-actions";
import { v4 } from "uuid";
import { useEffect, useState } from "react";

interface RoomItemProps {
  room: Room;
  selectedRoom: Room | null;
  onRoomSelect: (room: Room) => void;
  onLeaveRoom: (roomId: string) => void;
  onInviteUser: (roomId: string, email: string) => void;
  onEditRoom: (roomId: string, newName: string) => void;
  onDeleteRoom: (roomId: string) => void;
}

export function RoomItem({
  room,
  selectedRoom,
  onRoomSelect,
  onLeaveRoom,
}: RoomItemProps) {
  const { data: session } = useSession();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (session?.user?.id === room.createdBy) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  }, [session]);

  return (
    <div
      key={v4()}
      className={`p-3 rounded-lg hover:bg-gray-100 cursor-pointer group relative ${
        selectedRoom?._id === room._id ? "bg-gray-100" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div onClick={() => onRoomSelect(room)}>
          <h3 className="font-medium">{room.name}</h3>
          <p className="text-sm text-gray-500">
            {room?.participants!.length} participant(s)
          </p>
        </div>
        {isOwner ? (
          <RoomActions room={room} />
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="default"
                size="icon"
                className="opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40" align="end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLeaveRoom(room._id)}
                className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
              >
                Leave Room
              </Button>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
