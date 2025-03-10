import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { useEffect, useState } from "react";
// import { OnlineIndicator } from "./online-indicator";
// import { useOnlineStatus } from "@/contexts/online-status-context";
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

interface Participant {
  _id: string;
  username: string;
}

interface ParticipantItemProps {
  participant: Participant;
  isOwner: boolean;
  onRemove: (participantId: string, username: string) => void;
}

export function ParticipantItem({ participant, isOwner, onRemove }: ParticipantItemProps) {
  const { data: session } = useSession();
  const isCurrentUser = session?.user?.id === participant._id;

  return (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
            {participant.username.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
        </div>
        <div>
          <p className="font-medium text-sm text-gray-800">
            {participant.username} {isCurrentUser && "(You)"}
          </p>
        </div>
      </div>
      
      {isOwner && !isCurrentUser && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Participant</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {participant.username} from this room? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onRemove(participant._id, participant.username)}
                className="bg-red-500 hover:bg-red-600"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
