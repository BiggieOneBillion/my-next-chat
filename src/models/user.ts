import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    image: String,
    // Virtual fields for relationships
    friends: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Friend" }],
      default: [],
    },
    status: {
      type: String,
      enum: ["online", "offline", "away"],
      default: "offline",
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    // Add this to ensure the schema matches Auth.js expectations
    statics: {
      async findByEmail(email: string) {
        return this.findOne({ email }).exec();
      },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for getting friends
userSchema.virtual('friendsList', {
  ref: 'Friend',
  localField: '_id',
  foreignField: 'userId',
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
