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
const express_1 = require("express");
const UserModel_1 = __importDefault(require("../model/UserModel"));
// Create a new instance of the Express Router
const LeaderBoardRouter = (0, express_1.Router)();
LeaderBoardRouter.get('/getRank', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userlist = [];
        const rankUsers = yield UserModel_1.default.find({}).sort({ tokenBalance: -1 });
        for (let i = 0; i < rankUsers.length; i++) {
            userlist.push({
                username: rankUsers[i].username,
                amount: rankUsers[i].tokenBalance
            });
        }
        res.json({ rankUsers: userlist });
    }
    catch (error) {
        console.log("rank user error => ", error);
        res.status(500).json({ success: false, msg: error });
    }
}));
exports.default = LeaderBoardRouter;
