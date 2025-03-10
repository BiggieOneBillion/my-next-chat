import { connectMongoDB } from "@/lib/mongodb";
import { Room } from "@/models/room";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = {
  params: {
    roomId: string;
  };
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    const url = new URL(request.url);
    const roomId = url.pathname.split("/").at(-2);

    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    // Check if user is in the room
    if (!room.participants.includes(session.user.id)) {
      return NextResponse.json(
        { message: "You are not a participant in this room" },
        { status: 403 }
      );
    }

    // Remove user from participants
    await Room.findByIdAndUpdate(roomId, {
      $pull: { participants: session.user.id },
    });

    return NextResponse.json({ message: "Left room successfully" });
  } catch (error) {
    console.error("LEAVE ROOM ERROR:", error);
    return NextResponse.json(
      { message: "Error leaving room" },
      { status: 500 }
    );
  }
}
