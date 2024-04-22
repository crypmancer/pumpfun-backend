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
const MissionModal_1 = __importDefault(require("../model/MissionModal"));
const middleware_1 = require("../middleware");
const bs58_1 = __importDefault(require("bs58"));
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const HistoryModel_1 = __importDefault(require("../model/HistoryModel"));
const connection = new web3_js_1.Connection(process.env.RPC_ENDPOINT ? process.env.RPC_ENDPOINT : (0, web3_js_1.clusterApiUrl)("devnet"));
const wallet = web3_js_1.Keypair.fromSecretKey(
//@ts-ignore
bs58_1.default.decode(process.env.TREASURY_PRIVATE_KEY));
function getTransactionInfo(signature) {
    return __awaiter(this, void 0, void 0, function* () {
        const transactioninfo = yield connection.getParsedTransaction(signature, "confirmed");
        if (transactioninfo) {
            return transactioninfo;
        }
        else {
            return false;
        }
    });
}
// Create a new instance of the Express Router
const MissionRouter = (0, express_1.Router)();
// @route    GET api/mission/getAll
// @desc     Get all missions
// @access   Public
MissionRouter.get("/getAll", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const missions = yield MissionModal_1.default.find({}).populate("users.userId");
        res.json({ missions });
    }
    catch (error) {
        console.log("get all missions error => ", error);
        res.status(500).json({ success: false, msg: error });
    }
}));
MissionRouter.get("/getOpened", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const missions = yield MissionModal_1.default.find({ state: 0 });
        res.json({ missions });
    }
    catch (error) {
        console.log("opend mission error ==> ", error);
        res.status(500).json({ success: false, msg: error });
    }
}));
MissionRouter.post("/addMission", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, content, goal } = req.body;
        const newMissionSchem = new MissionModal_1.default({
            title: title,
            explanation: content,
            goal: goal,
        });
        yield newMissionSchem.save();
        res.json({ success: true });
    }
    catch (error) {
        console.log("saving new mission error ==> ", error);
        res.status(500).json({ err: error });
    }
}));
// @route    GET api/mission/getOne/:missionId
// @desc     Get one mission
// @access   Private
MissionRouter.get("/getOne/:missionId", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { missionId } = req.params;
        const mission = yield MissionModal_1.default.findById(missionId);
        if (mission) {
            let totalBurn = 0;
            for (let i = 0; i < mission.users.length; i++) {
                totalBurn += mission.users[i].amount;
            }
            res.json({ mission, totalBurn });
        }
        else {
            res.status(500).json({ err: "This mission does not exist!" });
        }
    }
    catch (error) {
        console.log("get one mission error ==> ", error);
        res.status(500).json({ err: error });
    }
}));
// @route    POST api/mission/joinUser
// @desc     Post join new user
// @access   Private
MissionRouter.post("/joinUser", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        //@ts-ignore
        const { _id } = req.user;
        const { missionId, signature } = req.body;
        const mission = yield MissionModal_1.default.findById(missionId);
        if (!mission) {
            return res.status(500).json({ err: "This mission does not exist!" });
        }
        if (mission.state == 1)
            return res
                .status(500)
                .json({ err: "Oops, this mission was already done!" });
        const user = yield UserModel_1.default.findById(_id);
        if (!user)
            return res
                .status(500)
                .json({ success: false, msg: "User does not exist!" });
        const isHistory = yield HistoryModel_1.default.findOne({ signature: signature });
        if (isHistory)
            return res
                .status(500)
                .json({ err: "This signature is already registerd!" });
        try {
            const txDetails = yield getTransactionInfo(signature);
            const txType = 
            //@ts-ignore
            txDetails.transaction.message.instructions[2].parsed.type;
            if (txType != "transfer")
                return res
                    .status(500)
                    .json({ err: "This transaction is not transaction for transfer!" });
            const treasuryTkAccount = 
            //@ts-ignore
            txDetails.transaction.message.instructions[2].parsed.info.authority;
            const destination = 
            //@ts-ignore
            txDetails.transaction.message.instructions[2].parsed.info.destination;
            //@ts-ignore
            const tokenMintAddress = (_a = txDetails.meta) === null || _a === void 0 ? void 0 : _a.postTokenBalances[0].mint;
            if (destination == process.env.TREASURY_TOKEN_ACCOUNT_ADDRESS &&
                treasuryTkAccount == (user === null || user === void 0 ? void 0 : user.walletAddress) &&
                process.env.TOKEN_MINT_ADDRESS == tokenMintAddress) {
                const amount = Number(
                //@ts-ignore
                txDetails.transaction.message.instructions[2].parsed.info
                    .amount) / 1000000000;
                const userIndex = mission.users.findIndex((user) => {
                    return user.userId.toString() === _id;
                });
                if (userIndex === -1) {
                    mission.users.push({ userId: _id, amount: amount });
                }
                else {
                    mission.users[userIndex].amount += Number(amount);
                }
                const newMission = yield mission.save();
                const newHistory = new HistoryModel_1.default({
                    type: "burn",
                    signature: signature,
                    userId: _id,
                    amount: amount,
                    missionId: missionId,
                });
                yield newHistory.save();
                const currentBalance = user === null || user === void 0 ? void 0 : user.tokenBalance;
                yield UserModel_1.default.updateOne({ _id: _id }, { tokenBalance: currentBalance ? currentBalance : 0 + amount }, { new: true });
                const totalAmount = newMission.users.reduce((sum, user) => sum + user.amount, 0);
                if (newMission.goal <= totalAmount) {
                    yield MissionModal_1.default.findOneAndUpdate({ _id: missionId }, { state: 1 });
                    /// token burn function here
                    // Step 1 fetch associated token account address
                    const account = yield (0, spl_token_1.getAssociatedTokenAddress)(
                    //@ts-ignore
                    new web3_js_1.PublicKey(process.env.TOKEN_MINT_ADDRESS), wallet.publicKey);
                    console.log(`    ✅ - Associated Token Account Address: ${account.toString()}`);
                    // Step 2 Create Burn Instruction
                    console.log("Step 2 - Crate Burn Instructions");
                    const burnIx = (0, spl_token_1.createBurnCheckedInstruction)(account, 
                    //@ts-ignore
                    new web3_js_1.PublicKey(process.env.TOKEN_MINT_ADDRESS), wallet.publicKey, newMission.goal * Math.pow(10, 9), 9);
                    console.log(`    ✅ - Burn Instruction Created`);
                    // Step 3 - Fetch Blockhash
                    console.log("Step 3 - Fetch Blockhash");
                    const { blockhash, lastValidBlockHeight } = yield connection.getLatestBlockhash("finalized");
                    console.log(`    ✅ - Latest Blockhash: ${blockhash}`);
                    // Step 4 - Assemble Transaction
                    console.log("Step 4 - Assemble Transaction");
                    const messageV0 = new web3_js_1.TransactionMessage({
                        payerKey: wallet.publicKey,
                        recentBlockhash: blockhash,
                        instructions: [burnIx],
                    }).compileToV0Message();
                    const transaction = new web3_js_1.VersionedTransaction(messageV0);
                    transaction.sign([wallet]);
                    console.log(`    ✅ - Transaction Created and Signed`);
                    // Step 5 - Execute & confirm transaction
                    console.log("Step 5 - execute & confirm transaction");
                    const txId = yield connection.sendTransaction(transaction);
                    console.log("    ✅ - Transaction sent to network");
                    const confirmation = yield connection.confirmTransaction({
                        signature: txId,
                        blockhash: blockhash,
                        lastValidBlockHeight: lastValidBlockHeight,
                    });
                    if (confirmation.value.err) {
                        throw new Error("❌ - Transaction not confirmed.");
                    }
                    console.log("🔥 SUCCESSFUL BURN!🔥", "\n", `https://explorer.solana.com/tx/${txId}`);
                    res.json({ missionClosed: true });
                }
                else {
                    res.json({ newMission });
                }
            }
        }
        catch (error) {
            console.log("transaction valid error => ", error);
            res.status(500).json({ err: error });
        }
    }
    catch (error) {
        console.log("/joinUser error => ", error);
        res.status(500).json({ err: error });
    }
}));
//@route    GET history
MissionRouter.get("/getHistory/:missionId", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { missionId } = req.params;
        //@ts-ignore
        const { _id } = req.user;
        const histories = yield HistoryModel_1.default.find({
            missionId: missionId,
            userId: _id,
        });
        res.json({ histories });
    }
    catch (error) {
        console.log("getting hostory error ==> ", error);
        res.status(500).json({ err: error });
    }
}));
exports.default = MissionRouter;
