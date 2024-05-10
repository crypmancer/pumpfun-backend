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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserModel_1 = __importDefault(require("../model/UserModel"));
const middleware_1 = require("../middleware");
const config_1 = require("../config");
const UserModel_2 = __importDefault(require("../model/UserModel"));
// Create a new instance of the Express Router
const UserRouter = (0, express_1.Router)();
// @route    POST api/users/register
// @desc     Register user
// @access   Public
UserRouter.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { walletAddress } = req.body;
    try {
        if (!walletAddress || walletAddress === "")
            return res.status(500).json({ msg: "Please provide a wallet address" });
        const user = yield UserModel_1.default.findOne({ walletAddress: walletAddress });
        if (user) {
            const payload = {
                walletAddress: user.walletAddress,
                id: user._id
            };
            const token = jsonwebtoken_1.default.sign(payload, config_1.JWT_SECRET);
            res.json({ token: token, user: user });
        }
        else {
            const newUser = new UserModel_2.default({
                walletAddress: walletAddress
            });
            const newuser = yield newUser.save();
            const payload = {
                username: newuser.username,
                walletAddress: newuser.walletAddress,
                id: newuser._id
            };
            const token = jsonwebtoken_1.default.sign(payload, config_1.JWT_SECRET);
            res.json({ token: token, user: newuser });
        }
    }
    catch (error) {
        console.log("registering error => ", error);
        res.status(500).json({ err: error });
    }
}));
// @route    POST api/users/update
// @desc     Update user info
// @access   Public
UserRouter.post("/update", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    console.log('user id => ', id);
    console.log('user info => ', req.user);
    const { username } = req.body;
    try {
        const user = yield UserModel_2.default.findById(id);
        if (!user)
            return res.status(500).json({ err: "This user does not exist!" });
        const updateUser = yield UserModel_2.default.findByIdAndUpdate(id, { username: username }, { new: true });
        res.json({ user: updateUser });
    }
    catch (error) {
        console.log("updating user error => ", error);
        res.status(500).json({ err: error });
    }
}));
exports.default = UserRouter;
