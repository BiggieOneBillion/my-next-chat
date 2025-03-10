import { connectMongoDB } from "@/lib/mongodb";
import { Block } from "@/models/block";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Get block status with a specific user
export async function GET(
  req: Request,
  // { params }: { params: { userId: string } }
) {

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const userId = pathParts[pathParts.length - 1];

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();
    // const { userId } = params;

    // Check if current user has blocked the target user
    const isBlocked = await Block.findOne({
      userId: session.user.id,
      blockedUserId: userId,
    });

    // Check if current user is blocked by the target user
    const isBlockedBy = await Block.findOne({
      userId: userId,
      blockedUserId: session.user.id,
    });

    return NextResponse.json({
      isBlocked: !!isBlocked,
      isBlockedBy: !!isBlockedBy,
    });
  } catch (error) {
    console.error("GET BLOCK STATUS ERROR:", error);
    return NextResponse.json(
      { message: "Error fetching block status" },
      { status: 500 }
    );
  }
}

// Unblock a user
export async function DELETE(
  req: Request,
  // { params }: { params: { userId: string } }
) {

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const userId = pathParts[pathParts.length - 1];

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();
    // const { userId } = params;

    const result = await Block.deleteOne({
      userId: session.user.id,
      blockedUserId: userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Block not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "User unblocked successfully" });
  } catch (error) {
    console.error("UNBLOCK USER ERROR:", error);
    return NextResponse.json(
      { message: "Error unblocking user" },
      { status: 500 }
    );
  }
}