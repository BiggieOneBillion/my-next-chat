import { connectMongoDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { User } from "@/models/user";

interface Credentials {
  email?: string;
  password?: string;
}

export async function authenticateUser(credentials: Credentials) {
  try {
    await connectMongoDB();

    const user = await User.findOne({ email: credentials?.email });

    if (!user || !credentials?.password) {
      return null;
    }

    const passwordMatch = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!passwordMatch) {
      return null;
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
    };
  } catch (error) {
    return null;
  }
}
