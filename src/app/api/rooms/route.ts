import { connectMongoDB } from "@/lib/mongodb";
import { Room } from "@/models/room";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await req.json();

    await connectMongoDB();

    const room = await Room.create({
      name,
      description,
      createdBy: session.user.id,
      participants: [session.user.id],
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error("CREATE ROOM ERROR:", error);
    return NextResponse.json(
      { message: "Error creating room" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    const rooms = await Room.find({
      participants: session.user.id,
    }).populate("participants", "username email");

    return NextResponse.json(rooms);
  } catch (error) {
    console.error("GET ROOMS ERROR:", error);
    return NextResponse.json(
      { message: "Error fetching rooms" },
      { status: 500 }
    );
  }
}
