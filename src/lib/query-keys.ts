// Add this to your existing query keys
export const queryKeys = {
  rooms: {
    all: ['rooms'] as const,
    byId: (roomId: string) => ['rooms', roomId] as const,
    messages: (roomId: string) => ['messages', roomId] as const,
    participants: (roomId: string) => ['rooms', roomId, 'participants'] as const,
  },
  users: {
    all: ['users'] as const,
    byId: (userId: string) => ['users', userId] as const,
  },
  directChats: {
    all: ['directChats'] as const,
    byId: (userId: string) => ['directChats', userId] as const,
    messages: (userId: string) => ['directChats', userId, 'messages'] as const,
  },
  
  directMessages: {
    all: ["directMessages"],
    conversation: (userId: string) => ["directMessages", userId],
    unreadCounts: ["directMessages", "unreadCounts"],
  },
  blocks:{
    all: ['block'] as const,
    status: (userId: string) => ['block', userId] as const,

  }
};