"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongoDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectMongoDB = async () => {
    try {
        if (mongoose_1.default.connection.readyState === 1) {
            return;
        }
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log("Connected to database");
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};
exports.connectMongoDB = connectMongoDB;
