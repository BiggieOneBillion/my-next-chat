import { Participant } from "@/components/room-list";
import { create } from "zustand";

interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

interface Room {
  _id: string;
  name: string;
  description?: string;
  participants?: Participant[];
  createdBy?: string;
}

interface ChatStore {
  selectedRoom: any;
  setSelectedRoom: (room: any) => void;
  selectedUser: any;
  setSelectedUser: (user: any) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  selectedRoom: null,
  setSelectedRoom: (room) => set({ selectedRoom: room }),
  selectedUser: null,
  setSelectedUser: (user) => set({ selectedUser: user }),
}));
