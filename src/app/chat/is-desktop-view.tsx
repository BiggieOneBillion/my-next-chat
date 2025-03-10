"use client";
import { useSession } from "next-auth/react";
import { useChatStore } from "@/store/chat-store";
import { RoomManagementColumn } from "@/components/room/room-management-column";
import { useState } from "react";
import { DesktopChatView } from "@/components/desktop-chat-view";
import { DirectMessageChat } from "@/components/direct-message-chat";

export default function ChatPageDesktopView() {
  const { selectedRoom, setSelectedRoom, selectedUser } = useChatStore();
  const { data: session } = useSession();
  const [isRoomChat, setIsRoomChat] = useState(true);

  return (
    <div className="min-h-screen h-screen flex flex-col p-0">
      <div className="flex-1 grid grid-cols-[280px,1fr]">
        <RoomManagementColumn
          selectedRoom={selectedRoom}
          setSelectedRoom={setSelectedRoom}
          setIsRoomChat={setIsRoomChat}
        />

        {/* Chat Section */}
        {isRoomChat ? (
          // Room Chat View
          selectedRoom ? (
            <DesktopChatView
              roomId={selectedRoom._id}
              participants={selectedRoom.participants || []}
              isOwner={session?.user?.id === selectedRoom.createdBy}
              showParticipants={true}
              roomName={selectedRoom.name || "Chat"}
              roomDescription={selectedRoom.description || ""}
              chatType="room"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                Select a room to start chatting
              </p>
            </div>
          )
        ) : (
          // Direct Message View
          selectedUser ? (
            <DirectMessageChat
              recipientId={selectedUser._id}
              recipientName={selectedUser.username}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                Select a user to start a direct conversation
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
