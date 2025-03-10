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

    // Extract `roomId` from the request URL
    const url = new URL(req.url);
    const roomId = url.pathname.split("/").at(-1); // Adjust based on your route structure

    if (!roomId) {
      return NextResponse.json({ message: "Room ID missing" }, { status: 400 });
    }

    // Check if room exists and user is the creator
    const room = await Room.findOne({
      _id: roomId,
      createdBy: session.user.id,
    });

    if (!room) {
      return NextResponse.json(
        { message: "Room not found or unauthorized" },
        { status: 404 }
      );
    }

    await Room.findByIdAndDelete(roomId);

    return NextResponse.json(
      { message: "Room deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE ROOM ERROR:", error);
    return NextResponse.json(
      { message: "Error deleting room" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    // console.log("UPDATED NAME----", name);

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { message: "Invalid room name" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Extract `roomId` from the request URL
    const url = new URL(req.url);
    const roomId = url.pathname.split("/").at(-1); // Adjust based on your route structure

    // console.log("SESSION ID", session.user.id);

    // Check if room exists and user is the creator
    const room = await Room.findOne({
      _id: roomId,
      createdBy: session.user.id,
    });

    // console.log("ROOM----", room);

    if (!room) {
      return NextResponse.json(
        { message: "Room not found or unauthorized" },
        { status: 404 }
      );
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { name },
      { new: true }
    ).populate("participants", "name email");

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error("UPDATE ROOM ERROR:", error);
    return NextResponse.json(
      { message: "Error updating room" },
      { status: 500 }
    );
  }
}
