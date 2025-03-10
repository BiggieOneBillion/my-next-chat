import { connectMongoDB } from "@/lib/mongodb";
import { Block } from "@/models/block";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Create a new block
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();
    const { blockedUserId } = await req.json();

    if (!blockedUserId) {
      return NextResponse.json(
        { message: "Blocked user ID is required" },
        { status: 400 }
      );
    }

    // Check if block already exists
    const existingBlock = await Block.findOne({
      userId: session.user.id,
      blockedUserId,
    });

    if (existingBlock) {
      return NextResponse.json(
        { message: "User is already blocked" },
        { status: 400 }
      );
    }

    // Create new block
    const block = await Block.create({
      userId: session.user.id,
      blockedUserId,
    });

    return NextResponse.json(block, { status: 201 });
  } catch (error) {
    console.error("BLOCK USER ERROR:", error);
    return NextResponse.json(
      { message: "Error blocking user" },
      { status: 500 }
    );
  }
}

// Get all blocked users
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    const blocks = await Block.find({
      userId: session.user.id,
    }).populate("blockedUserId", "username email");

    return NextResponse.json(blocks);
  } catch (error) {
    console.error("GET BLOCKED USERS ERROR:", error);
    return NextResponse.json(
      { message: "Error fetching blocked users" },
      { status: 500 }
    );
  }
}