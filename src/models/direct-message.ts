import mongoose from "mongoose";

const directMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create a compound index for efficient querying of conversations
directMessageSchema.index({ senderId: 1, receiverId: 1 });

export const DirectMessage = mongoose.models.DirectMessage || 
  mongoose.model("DirectMessage", directMessageSchema);