import mongoose from "mongoose";

const friendSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    friendId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "blocked"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Create a compound index for efficient querying
friendSchema.index({ userId: 1, friendId: 1 }, { unique: true });

export const Friend = mongoose.models.Friend || 
  mongoose.model("Friend", friendSchema);