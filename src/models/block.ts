import mongoose, { Schema } from "mongoose";

const blockSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blockedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index to ensure a user can only block another user once
blockSchema.index({ userId: 1, blockedUserId: 1 }, { unique: true });

export const Block = mongoose.models.Block || mongoose.model("Block", blockSchema);