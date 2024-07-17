"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const TransactionSchema = new mongoose_1.default.Schema({
    type: {
        type: String,
        default: 'buy' // create / buy / sell
    },
    token: {
        type: String,
        ref: 'token'
    },
    user: {
        type: String,
        ref: 'user'
    },
    signature: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
});
const TransactionModel = mongoose_1.default.model("transaction", TransactionSchema);
exports.default = TransactionModel;
