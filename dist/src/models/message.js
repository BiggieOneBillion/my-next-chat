"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    roomId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
    },
    senderId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
exports.Message = mongoose_1.default.models.Message || mongoose_1.default.model('Message', messageSchema);
