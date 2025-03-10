export async function fetchRooms() {
  const response = await fetch("/api/rooms");
  if (!response.ok) {
    throw new Error("Failed to fetch rooms");
  }
  return response.json();
}

export async function inviteUser(roomId: string, email: string) {
  const response = await fetch(`/api/rooms/${roomId}/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`${JSON.parse(errorMessage).message}`);
  }
  return response.json();
}

export async function deleteRoom(roomId: string) {
  const response = await fetch(`/api/rooms/${roomId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete room");
  }
  return response.json();
}

export async function updateRoom(roomId: string, name: string) {
  const response = await fetch(`/api/rooms/${roomId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error("Failed to update room");
  }
  return response.json();
}

export async function leaveRoom(roomId: string) {
  const response = await fetch(`/api/rooms/${roomId}/leave`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to leave room");
  }
  return response.json();
}
