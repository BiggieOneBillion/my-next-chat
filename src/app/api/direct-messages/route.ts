import { connectMongoDB } from "@/lib/mongodb";
import { DirectMessage } from "@/models/direct-message";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();
    const { receiverId, content } = await req.json();

    if (!receiverId || !content) {
      return NextResponse.json(
        { message: "Recipient ID and content are required" },
        { status: 400 }
      );
    }

    const message = await DirectMessage.create({
      senderId: session.user.id,
      receiverId,
      content,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("SEND DIRECT MESSAGE ERROR:", error);
    return NextResponse.json(
      { message: "Error sending message" },
      { status: 500 }
    );
  }
}