import { connectMongoDB } from "@/lib/mongodb";
import { Room } from "@/models/room";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    const url = new URL(req.url);
    const roomId = url.pathname.split("/").at(-2);
    const participantId = url.searchParams.get("id");

    if (!roomId) {
      return NextResponse.json(
        { message: "Room ID not provided" },
        { status: 400 }
      );
    }

    if (!participantId) {
      return NextResponse.json(
        { message: "Participant ID not provided" },
        { status: 400 }
      );
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    // Check if the user is the room owner
    if (room.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Only room owner can remove participants" },
        { status: 403 }
      );
    }

    // Remove participant from the room
    await Room.findByIdAndUpdate(roomId, {
      $pull: { participants: participantId },
    });

    return NextResponse.json({ message: "Participant removed successfully" });
  } catch (error) {
    console.error("REMOVE PARTICIPANT ERROR:", error);
    return NextResponse.json(
      { message: "Error removing participant" },
      { status: 500 }
    );
  }
}
