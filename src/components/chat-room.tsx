"use client";
import React, { useEffect, useState } from "react";
import { socket } from "../lib/socket-client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const ChatRoom = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const [message, setMessage] = useState<{ sender: string; message: string }[]>([]);
  const roomId = "room-1"; // You can make this dynamic based on your needs

  useEffect(() => {
    // Join the room when component mounts
    socket.emit("join-room", roomId);

    const handleMessage = (message: any) => {
      setMessage((prev) => [...prev, { sender: message.sender, message: message.text }]);
      console.log('New message received:', message);
    };

    socket.on("new-message", handleMessage);

    return () => {
      socket.off("new-message", handleMessage);
    };
  }, []);

  const sendMessage = () => {
    const messageData = {
      sender: session?.user?.name || "Anonymous",
      text: "Hello, this is a test message",
      roomId: roomId
    };
    socket.emit("send-message", messageData);
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <button onClick={sendMessage}>Send Test Message</button>
      {message.map((msg, index) => (
        <div key={index}>
          <strong>{msg.sender}:</strong> {msg.message}
        </div>
      ))}
    </div>
  );
};

export default ChatRoom;
