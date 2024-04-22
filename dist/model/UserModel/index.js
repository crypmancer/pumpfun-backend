"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        default: 'user',
    },
    walletAddress: {
        type: String,
        required: true,
        unique: true
    },
    tokenBalance: {
        type: Number,
        default: 0,
    },
    avatar: {
        type: String
    },
    referrerId: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    role: {
        type: Number,
        default: 0
    },
});
const UserModel = mongoose_1.default.model("user", UserSchema);
exports.default = UserModel;
