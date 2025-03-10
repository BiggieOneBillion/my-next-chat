"use client";
import { useSession } from "next-auth/react";
import { useRoom } from "@/contexts/room-context";
import { RoomActions } from "./room/room-actions";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MoreVertical } from "lucide-react";
import { useEffect } from "react";
import { v4 } from "uuid";
import { queryKeys } from "@/lib/query-keys";
import { fetchRooms } from "@/lib/api/rooms";
import { useQuery } from "@tanstack/react-query";

// Add these props to the component
interface RoomListProps {
  onRoomSelect: (room: Room | null) => void;
  selectedRoom: Room | null;
}

export interface Participant {
  _id: string; // Assuming _id is a string; adjust if it's an ObjectId
  email: string;
  username: string;
}

export interface Room {
  _id: string; // Assuming _id is a string; adjust if it's an ObjectId
  name: string;
  description?: string;
  createdBy?: string; // Assuming createdBy is a string; adjust if it's an ObjectId
  participants?: Participant[];
  createdAt?: Date;
  updatedAt?: Date;
}

export function RoomList({ onRoomSelect, selectedRoom }: RoomListProps) {
  const { data: session } = useSession();

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: queryKeys.rooms.all,
    queryFn: fetchRooms,
  });

  const { handleLeaveRoom } = useRoom();

  useEffect(() => {
    if (rooms && rooms.length > 0 && selectedRoom === null) {
      onRoomSelect(rooms[0]);
    }
  }, [rooms]);

  useEffect(() => {
    if (
      selectedRoom &&
      !rooms.find((el: Room) => el._id === selectedRoom?._id)
    ) {
      onRoomSelect(rooms[0]);
    }
  }, [rooms]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-2">
      {rooms.map((room: Room) => (
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
            {session?.user?.id === room.createdBy ? (
              <RoomActions room={room} />
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
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
                    onClick={() => handleLeaveRoom(room._id)}
                    className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                  >
                    Leave Room
                  </Button>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
