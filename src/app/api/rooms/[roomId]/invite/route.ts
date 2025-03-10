import { connectMongoDB } from "@/lib/mongodb";
import { Room } from "@/models/room";
import { User } from "@/models/user";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();

    const { roomId } = await params;

    await connectMongoDB();

    // Find the user to invite
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return NextResponse.json(
        { message: "User not registered" },
        { status: 404 }
      );
    }

    // Check if user is already in the room
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    if (room.participants.includes(userToInvite._id)) {
      return NextResponse.json(
        { message: "User is already in the room" },
        { status: 400 }
      );
    }

    // Add user to room
    await Room.findByIdAndUpdate(roomId, {
      $push: { participants: userToInvite._id },
    });

    return NextResponse.json(
      { message: "User invited successfully" },
      { status: 200 }
    );
  } catch {
    // console.error("INVITE USER ERROR:", error);
    return NextResponse.json(
      { message: "Please try again after some time" },
      { status: 500 }
    );
  }
}
