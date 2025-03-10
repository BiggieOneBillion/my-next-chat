import { connectMongoDB } from "@/lib/mongodb";
import { Friend } from "@/models/friend";
import { User } from "@/models/user";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();
    const { userId } = await req.json();

    // Validate target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if friendship already exists
    const existingFriendship = await Friend.findOne({
      $or: [
        { userId: session.user.id, friendId: userId },
        { userId: userId, friendId: session.user.id }
      ]
    });

    if (existingFriendship) {
      // If friendship exists, just return it
      return NextResponse.json({ 
        message: "Direct chat already exists",
        friendship: existingFriendship
      });
    }

    // Create bidirectional friendship (both users are friends with each other)
    const friendship1 = await Friend.create({
      userId: session.user.id,
      friendId: userId,
      status: "accepted" // Auto-accept for simplicity
    });

    const friendship2 = await Friend.create({
      userId: userId,
      friendId: session.user.id,
      status: "accepted" // Auto-accept for simplicity
    });

    return NextResponse.json({ 
      message: "Direct chat created successfully",
      friendship: friendship1
    }, { status: 201 });
  } catch (error) {
    console.error("CREATE DIRECT CHAT ERROR:", error);
    return NextResponse.json(
      { message: "Error creating direct chat" },
      { status: 500 }
    );
  }
}

// Get all direct chats for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    // Find all friendships where the current user is involved
    const friendships = await Friend.find({
      userId: session.user.id,
      status: "accepted"
    }).populate("friendId", "username email");

    return NextResponse.json(friendships);
  } catch (error) {
    console.error("GET DIRECT CHATS ERROR:", error);
    return NextResponse.json(
      { message: "Error fetching direct chats" },
      { status: 500 }
    );
  }
}