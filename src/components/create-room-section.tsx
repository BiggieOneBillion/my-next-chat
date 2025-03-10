"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CreateRoomDialog } from "./dialogs/create-room-dialog";
import { InviteUserDialog, Room } from "./dialogs/invite-user-dialog";

export function CreateRoomSection() {
  const [rooms, setRooms] = useState<Room[]>([]);

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      if (!response.ok) throw new Error("Failed to fetch rooms");
      const data = await response.json();
      setRooms(data as Room[]);
    } catch (error) {
      toast.error("Failed to fetch rooms");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleRoomCreated = (newRoom: any) => {
    setRooms((prev) => [...prev, newRoom]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Rooms</h2>
        <div className="flex gap-2">
          <CreateRoomDialog onRoomCreated={handleRoomCreated} />
          {/* <InviteUserDialog rooms={rooms! as Room[]} /> */}
        </div>
      </div>
    </div>
  );
}
