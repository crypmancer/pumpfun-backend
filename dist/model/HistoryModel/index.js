"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const HistorySchema = new mongoose_1.default.Schema({
    type: {
        type: String,
        default: "deposit" // deposit, withdraw, burn
    },
    signature: {
        type: String,
        required: true,
        unique: true
    },
    tokenAddress: {
        type: String
    }
});
const HistoryModal = mongoose_1.default.model("history", HistorySchema);
exports.default = HistoryModal;
