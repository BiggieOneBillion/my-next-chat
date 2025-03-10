import { connectMongoDB } from "@/lib/mongodb";
import { Message } from "@/models/message";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    // Extract `roomId` from request URL
    const url = new URL(request.url);
    const roomId = url.pathname.split("/").at(-2);

    const messages = await Message.find({ roomId })
      .populate("senderId", "username")
      .sort({ createdAt: 1 });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { content, type } = await req.json();

    await connectMongoDB();

    const url = new URL(req.url);
    const roomId = url.pathname.split("/").at(-2);

    const message = await Message.create({
      roomId: roomId,
      senderId: session.user.id,
      content,
      type,
    });

    const populatedMessage = await message.populate("senderId", "name");

    return NextResponse.json(populatedMessage, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error sending message" },
      { status: 500 }
    );
  }
}
