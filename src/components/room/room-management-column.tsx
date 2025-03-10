import { CreateRoomSection } from "../create-room-section";
import { RoomList } from "../room-list";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Room } from "../room-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserList } from "../../components/user-list"; // We'll create this component next
import { Dispatch, SetStateAction, useState } from "react";

interface RoomManagementColumnProps {
  selectedRoom: Room | null;
  setSelectedRoom: (room: Room | null) => void;
  setIsRoomChat: Dispatch<SetStateAction<boolean>>;
}

export function RoomManagementColumn({
  selectedRoom,
  setSelectedRoom,
  setIsRoomChat,
}: RoomManagementColumnProps) {
  const [toggle, setToggle] = useState(false);
  const handleSwitchToPersonalChat = () => {
    setToggle(true);
    setIsRoomChat(false);
  };
  const handleSwitchToGroupChat = () => {
    setToggle(false);
    setIsRoomChat(true);
  };

  return (
    <div className="border-r flex flex-col border-gray-200 p-4">
      <Tabs defaultValue="rooms" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger
            onClick={handleSwitchToGroupChat}
            value="rooms"
            className="flex-1y"
          >
            Rooms
          </TabsTrigger>
          <TabsTrigger
            onClick={handleSwitchToPersonalChat}
            value="direct"
            className="flex-1"
          >
            Direct Messages
          </TabsTrigger>
        </TabsList>

        {!toggle && (
          <TabsContent
            value="rooms"
            className="flex flex-col h-[calc(100vh-140px)] bg-blue-900y"
          >
            <CreateRoomSection />
            <div className="mt-6 flex-1 overflow-y-auto">
              <RoomList
                onRoomSelect={setSelectedRoom}
                selectedRoom={selectedRoom}
              />
            </div>
          </TabsContent>
        )}

        <TabsContent value="direct" className="h-[calc(100vh-140px)]  ">
          <UserList onUserSelect={setSelectedRoom} />
        </TabsContent>
      </Tabs>

      <div className="mt-4 w-full">
        <Button
          variant="default"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
