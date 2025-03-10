import { connectMongoDB } from "@/lib/mongodb";
import { User } from "@/models/user";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    await connectMongoDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(null);
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(null);
  }
}
