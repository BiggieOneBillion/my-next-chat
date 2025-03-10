import { connectMongoDB } from "@/lib/mongodb";
import { DirectMessage } from "@/models/direct-message";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    // Find all unread messages where the current user is the recipient
    const unreadMessages = await DirectMessage.find({
      receiverId: session.user.id,
      read: false
    });

    // Count unread messages by sender
    const unreadCounts: Record<string, number> = {};
    
    unreadMessages.forEach((message) => {
      const senderId = message.senderId.toString();
      unreadCounts[senderId] = (unreadCounts[senderId] || 0) + 1;
    });

    return NextResponse.json(unreadCounts);
  } catch (error) {
    console.error("GET UNREAD COUNTS ERROR:", error);
    return NextResponse.json(
      { message: "Error fetching unread message counts" },
      { status: 500 }
    );
  }
}