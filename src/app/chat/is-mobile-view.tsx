"use client";
import { useState } from "react";
import { RoomList } from "@/components/room-list";
import { UserList } from "@/components/user-list";
import { ParticipantsList } from "@/components/participants-list";
import { ChatMessages } from "@/components/chat-messages";
import { DirectMessageChat } from "@/components/direct-message-chat";
import { Button } from "@/components/ui/button";
import { CreateRoomSection } from "@/components/create-room-section";
import { signOut, useSession } from "next-auth/react";
import {
  LogOut,
  Menu,
  Users,
  MessageCircle,
  MessageSquare,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useChatStore } from "@/store/chat-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ChatPageMobileView = () => {
  const { selectedRoom, setSelectedRoom, selectedUser, setSelectedUser } =
    useChatStore();
  const { data: session } = useSession();
  const [isRoomsOpen, setIsRoomsOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"rooms" | "direct">("rooms");

  // Determine if we're in a chat view (either room or direct message)
  const isInChatView = selectedRoom || selectedUser;

  // Determine if we're in a direct message chat
  const isDirectChat = !selectedRoom && selectedUser;

  const handleBackToList = () => {
    if (selectedRoom) setSelectedRoom(null);
    if (selectedUser) setSelectedUser(null);
  };

  return (
    <div className="h-[100svh] flex flex-col">
      {/* Header */}
      <div className="px-4 py-2 border-b flex items-center justify-between bg-white">
        {isInChatView ? (
          <>
            <Sheet open={isRoomsOpen} onOpenChange={setIsRoomsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b flex-1">
                    <Tabs
                      defaultValue={activeTab}
                      onValueChange={(value) =>
                        setActiveTab(value as "rooms" | "direct")
                      }
                    >
                      <TabsList className="w-full mb-4">
                        <TabsTrigger value="rooms" className="flex-1">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Rooms
                        </TabsTrigger>
                        <TabsTrigger value="direct" className="flex-1">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Direct
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="rooms">
                        <RoomList
                          onRoomSelect={(room) => {
                            setSelectedRoom(room);
                            setSelectedUser(null);
                            setIsRoomsOpen(false);
                          }}
                          selectedRoom={selectedRoom}
                        />
                      </TabsContent>

                      <TabsContent value="direct">
                        <UserList
                          onUserSelect={(user) => {
                            setSelectedUser(user);
                            setSelectedRoom(null);
                            setIsRoomsOpen(false);
                          }}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                  <div className="p-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="max-w-[200px] sm:max-w-fit truncate sm:text-center">
              {selectedRoom ? (
                <>
                  <h1 className="font-semibold capitalize sm:text-center">
                    {selectedRoom.name}
                  </h1>
                  <p className="text-gray-400 text-sm">
                    {selectedRoom.description}
                  </p>
                </>
              ) : selectedUser ? (
                <>
                  <h1 className="font-semibold sm:text-center">
                    {selectedUser.username}
                  </h1>
                  <p className="text-gray-400 text-sm">Direct Message</p>
                </>
              ) : null}
            </div>

            {selectedRoom && (
              <Sheet
                open={isParticipantsOpen}
                onOpenChange={setIsParticipantsOpen}
              >
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Users className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  {selectedRoom && (
                    <ParticipantsList
                      participants={selectedRoom.participants!}
                      roomId={selectedRoom._id}
                      isOwner={session?.user?.id === selectedRoom.createdBy}
                    />
                  )}
                </SheetContent>
              </Sheet>
            )}

            {/* For direct messages, we don't need the participants button */}
            {isDirectChat && (
              <Button variant="ghost" size="icon" onClick={handleBackToList}>
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </>
        ) : (
          <>
            <h1 className="font-semibold">Chats</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {isInChatView ? (
          // Chat View (either room or direct)
          <div className="h-full flex flex-col bg-gray-50 px-2">
            {selectedRoom ? (
              <ChatMessages roomId={selectedRoom._id} />
            ) : selectedUser ? (
              <DirectMessageChat
                recipientId={selectedUser._id}
                recipientName={selectedUser.username}
              />
            ) : null}
          </div>
        ) : (
          // List View (either rooms or direct messages)
          <div className="h-full flex flex-col">
            <Tabs
              defaultValue={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "rooms" | "direct")
              }
              className="w-full"
            >
              <div className="px-4 pt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="rooms" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Rooms
                  </TabsTrigger>
                  <TabsTrigger value="direct" className="flex-1">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Direct Messages
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="rooms"
                className="p-4 space-y-4 flex-1 overflow-y-auto"
              >
                <CreateRoomSection />
                <RoomList
                  onRoomSelect={setSelectedRoom}
                  selectedRoom={selectedRoom}
                />
              </TabsContent>

              <TabsContent
                value="direct"
                className="p-4 space-y-4 flex-1 overflow-y-auto"
              >
                <UserList
                  onUserSelect={(user) => {
                    setSelectedUser(user);
                    setSelectedRoom(null);
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPageMobileView;
