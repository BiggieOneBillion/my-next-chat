import { connectMongoDB } from "@/lib/mongodb";
import { User } from "@/models/user";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // console.log("REGISTER ROUTE---", name, email, password);

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Check if user exists by email
    const userExists = await User.findOne({ email });
    // console.log("USER EXISTS---", userExists);
    if (userExists) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // console.log("REGISTER ROUTE---", hashedPassword);

    // console.log("info", {
    //   name: name,
    //   email: email,
    //   password: hashedPassword,
    // });

    // Create new user with all required fields
    const user = await User.create({
      username: name,
      email: email,
      password: hashedPassword,
    });

    // console.log("USER---", user);

    const savedUsed = await user.save();

    return NextResponse.json(
      { message: "User registered successfully", user: savedUsed },
      { status: 201 }
    );
  } catch (error) {
    // console.log("REGISTRATION ERROR---", error);

    // More specific error handling
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "An error occurred while registering the user" },
      { status: 500 }
    );
  }
}
