"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterLast10Days = exports.parseTimestamp = exports.updatePermins = exports.getCurrentFormattedDateTime = void 0;
const TokenModel_1 = __importDefault(require("../model/TokenModel"));
const TradeModel_1 = __importDefault(require("../model/TradeModel"));
const getCurrentFormattedDateTime = (convertdate) => {
    const date = convertdate ? new Date(convertdate) : new Date();
    // Extract year, month, day, hours, minutes, and seconds
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    // Format into the desired string
    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDateTime;
};
exports.getCurrentFormattedDateTime = getCurrentFormattedDateTime;
const updatePermins = () => __awaiter(void 0, void 0, void 0, function* () {
    const tokens = yield TokenModel_1.default.find({});
    const currentTime = (0, exports.getCurrentFormattedDateTime)();
    console.log(`--------------updating token dates--------------\nCurrent time => ${currentTime}`);
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const newTrade = new TradeModel_1.default({
            token: token.address,
            price: token.price,
            timestamp: currentTime,
            volume: token.marketcap,
            supply: token.supply,
        });
        yield newTrade.save();
    }
});
exports.updatePermins = updatePermins;
const parseTimestamp = (timestampString) => {
    const [datePart, timePart] = timestampString.split(" ");
    const [year, month, day] = datePart.split("-");
    const [hour, minute, second] = timePart.split(":");
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
};
exports.parseTimestamp = parseTimestamp;
// Function to filter data within the last 10 days
const filterLast10Days = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(now.getDate() - 10);
    return data.filter((item) => {
        const itemDate = (0, exports.parseTimestamp)(item.timestamp);
        return itemDate >= tenDaysAgo && itemDate <= now;
    });
});
exports.filterLast10Days = filterLast10Days;
