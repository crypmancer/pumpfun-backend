"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const LeaderBoardModelSchema = new mongoose_1.default.Schema({
    token_name: {
        type: String,
        unique: true,
        required: true,
    },
    token_mint_address: {
        type: String,
        unique: true,
        required: true
    },
    token_avatar: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});
const LeaderBoardModel = mongoose_1.default.model("leaderboard", LeaderBoardModelSchema);
exports.default = LeaderBoardModel;
