export async function fetchMessages(roomId: string) {
  const response = await fetch(`/api/rooms/${roomId}/messages`);
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  return response.json();
}

export async function sendMessage(
  roomId: string, 
  content: string, 
  type: 'user' | 'system' = 'user'
) {
  const response = await fetch(`/api/rooms/${roomId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, type }),
  });
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  return response.json();
}