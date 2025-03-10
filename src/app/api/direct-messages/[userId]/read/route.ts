import { connectMongoDB } from "@/lib/mongodb";
import { DirectMessage } from "@/models/direct-message";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Mark messages as read
export async function POST(
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
    const userId = pathParts[pathParts.length - 2];

    await connectMongoDB();
    // const { userId } = params;

    // Mark all messages from the other user as read
    await DirectMessage.updateMany(
      {
        senderId: userId,
        receiverId: session.user.id,
        read: false,
      },
      {
        $set: { read: true },
      }
    );

    return NextResponse.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("MARK MESSAGES READ ERROR:", error);
    return NextResponse.json(
      { message: "Error marking messages as read" },
      { status: 500 }
    );
  }
}