import { connectMongoDB } from "@/lib/mongodb";
import { DirectMessage } from "@/models/direct-message";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Get conversation between current user and specified user
export async function GET(
  req: Request,
  // { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const userId = pathParts[pathParts.length - 1];

    await connectMongoDB();
    // const { userId } = params;

    const messages = await DirectMessage.find({
      $or: [
        { senderId: session.user.id, receiverId: userId },
        { senderId: userId, receiverId: session.user.id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "username")
      .populate("receiverId", "username");

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET DIRECT MESSAGES ERROR:", error);
    return NextResponse.json(
      { message: "Error fetching messages" },
      { status: 500 }
    );
  }
}