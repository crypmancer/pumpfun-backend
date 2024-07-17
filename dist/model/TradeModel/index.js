"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const TradeSchema = new mongoose_1.default.Schema({
    token: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Number
    },
    volume: {
        type: Number,
    },
    supply: {
        type: Number
    }
});
const TradeModel = mongoose_1.default.model("trade", TradeSchema);
exports.default = TradeModel;
