"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SoloMissionSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true
    },
    explanation: {
        type: String,
        required: true
    },
    goal: {
        type: Number,
        default: 100
    },
    state: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});
const SoloMissionModel = mongoose_1.default.model("solomission", SoloMissionSchema);
exports.default = SoloMissionModel;
