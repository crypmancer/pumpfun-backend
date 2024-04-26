"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = exports.PORT = exports.MONGO_URL = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
try {
    dotenv_1.default.config();
}
catch (error) {
    console.error("Error loading environment variables:", error);
    process.exit(1);
}
// export const MONGO_URL = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
exports.MONGO_URL = 'mongodb://mongo:KYtxYUlPJHLumZZERQRUMviexKSMsmlC@roundhouse.proxy.rlwy.net:21011';
exports.PORT = process.env.PORT || 9000;
exports.JWT_SECRET = process.env.JWT_SECRET || "JWT_SECRET";
