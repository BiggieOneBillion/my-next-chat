import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Made optional for system messages
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['user', 'system'],
    default: 'user',
  },
}, { timestamps: true });

export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);