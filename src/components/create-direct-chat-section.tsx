import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import { Plus, Search, UserPlus } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSession } from "next-auth/react";

export function CreateDirectChatSection() {
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const { data: users = [] } = useQuery({
    queryKey: queryKeys.users.all,
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
  });

  const createDirectChatMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch("/api/direct-chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        throw new Error("Failed to create direct chat");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
      setEmail("");
      setOpen(false);
      toast.success("Direct chat created successfully");
    },
    onError: () => {
      toast.error("Failed to create direct chat");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    const user = users.find((user: any) => user.email === email);
    if (user) {
      createDirectChatMutation.mutateAsync(user._id);
    } else {
      toast.error("User not found");
    }
  };

  const handleSelectUser = (userId: string) => {
    createDirectChatMutation.mutateAsync(userId);
  };

  const filteredUsers = users.filter((user: any) => 
    user._id !== session?.user?.id
  );

  console.log("----user data---------", users)

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium mb-2">Start a conversation</h3>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start text-sm text-muted-foreground"
          >
            <Search className="mr-2 h-4 w-4" />
            {email || "Search for a user..."}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start" side="bottom">
          <Command>
            <CommandInput 
              placeholder="Search by name or email..." 
              value={email}
              onValueChange={setEmail}
            />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                {filteredUsers.map((user: any) => (
                  <CommandItem
                    key={user._id}
                    value={user.username}
                    onSelect={() => handleSelectUser(user._id)}
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium mr-2">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <UserPlus className="ml-auto h-4 w-4 text-gray-400" />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Or enter email directly..."
          type="email"
          className="flex-1"
        />
        <Button 
          type="submit" 
          size="sm"
          disabled={createDirectChatMutation.isPending}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}