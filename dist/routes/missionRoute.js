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
const MissionModel_1 = __importDefault(require("../model/MissionModel"));
const middleware_1 = require("../middleware");
const bs58_1 = __importDefault(require("bs58"));
const web3_js_1 = require("@solana/web3.js");
const HistoryModel_1 = __importDefault(require("../model/HistoryModel"));
const SoloMissionModel_1 = __importDefault(require("../model/SoloMissionModel"));
const NotificationModel_1 = __importDefault(require("../model/NotificationModel"));
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
        const missions = yield MissionModel_1.default.find({}).populate("users.userId");
        res.json({ missions });
    }
    catch (error) {
        console.log("get all missions error => ", error);
        res.status(500).json({ success: false, msg: error });
    }
}));
MissionRouter.get("/getOpened", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const missions = yield MissionModel_1.default.find({ state: 0 });
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
        const { role } = req.user;
        if (role != 1)
            return res.status(500).json({ msg: "Server error!" });
        const newMissionSchem = new MissionModel_1.default({
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
MissionRouter.post("/missionComplete/:missionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { missionId } = req.params;
        const { signature } = req.body;
        console.log("signiation valid => ", signature);
        console.log("signiation valid => ", missionId);
        const mission = yield MissionModel_1.default.findById({ _id: missionId });
        if (!mission)
            return res.status(500).json({ err: "This mission does not exist!" });
        // try {
        //   const txDetails = await getTransactionInfo(signature);
        //   //@ts-ignore
        //   const txType = txDetails.transaction.message.instructions[2].parsed.type;
        //   if (txType != "burnChecked")
        //     return res
        //       .status(500)
        //       .json({ err: "This transaction is not transaction for burn!" });
        //   const amount =
        //     Number(
        //       //@ts-ignore
        //       txDetails.transaction.message.instructions[2].parsed.info
        //         .tokenAmount.amount
        //     ) / 1000000000 * 1.25;
        //     console.log('mission amount', amount);
        // } catch (error){
        //   console.log('mission complete error', error)
        //   res.status(500).json({err: error});
        // }
        const updatedMission = yield MissionModel_1.default.findOneAndUpdate({ _id: missionId }, { state: 2 }, { new: true });
        if (updatedMission) {
            for (let i = 0; i < mission.users.length; i++) {
                const newSchem = new NotificationModel_1.default({
                    userId: mission.users[i].userId,
                    missionId: missionId,
                    signature: signature
                });
                yield newSchem.save();
            }
            const updatedHome = yield UserModel_1.default.findOneAndUpdate({ walletAddress: process.env.TREASURY_WALLET_ADDRESS }, { $inc: { tokenBalance: mission.goal * 0.8 } }, { new: true });
            console.log('updated home', updatedHome);
            const history = new HistoryModel_1.default({
                signature: signature,
                type: 'missioncomplete',
                userId: 'admin',
                missionId: missionId
            });
            const historyrResult = yield history.save();
            res.json({ success: true });
        }
    }
    catch (error) {
        console.log("multi mission complete error", error);
        res.status(500).json({ err: error });
    }
}));
MissionRouter.delete("/:missionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { missionId } = req.params;
        const mission = yield MissionModel_1.default.findById({ _id: missionId });
        if (!mission)
            return res.status(500).json({ err: "This mission does not exist!" });
        yield MissionModel_1.default.findOneAndDelete({ _id: missionId });
        res.json({ success: true });
    }
    catch (error) {
        console.log("delete multi mission error", error);
        res.status(500).json({ err: error });
    }
}));
// @route    update api/missions/update/:missionId
// @desc     Get one mission
// @access   Private
MissionRouter.post("/update/:missionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { missionId } = req.params;
        const { title, content, goal } = req.body;
        const mission = yield MissionModel_1.default.findById(missionId);
        if (!mission)
            return res.status(500).json({ err: "This mission does not exist!" });
        const updatedMission = yield MissionModel_1.default.findByIdAndUpdate({ _id: missionId }, {
            title: title,
            explanation: content,
            goal: goal,
        });
        if (updatedMission) {
            res.json({ success: true });
        }
    }
    catch (error) {
        console.log("get one mission error ==> ", error);
        res.status(500).json({ err: error });
    }
}));
// @route    GET api/mission/getOne/:missionId
// @desc     Get one mission
// @access   Private
MissionRouter.get("/getOne/:missionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { missionId } = req.params;
        const mission = yield MissionModel_1.default.findById(missionId);
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
        const mission = yield MissionModel_1.default.findById(missionId);
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
                txDetails.transaction.message.instructions[2].parsed.info.amount) / 1000000000;
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
                    yield MissionModel_1.default.findOneAndUpdate({ _id: missionId }, { state: 1 });
                    /// token burn function here
                    // // Step 1 fetch associated token account address
                    // const account = await getAssociatedTokenAddress(
                    //   //@ts-ignore
                    //   new PublicKey(process.env.TOKEN_MINT_ADDRESS),
                    //   wallet.publicKey
                    // );
                    // console.log(
                    //   `    ✅ - Associated Token Account Address: ${account.toString()}`
                    // );
                    // // Step 2 Create Burn Instruction
                    // console.log("Step 2 - Crate Burn Instructions");
                    // const burnIx = createBurnCheckedInstruction(
                    //   account,
                    //   //@ts-ignore
                    //   new PublicKey(process.env.TOKEN_MINT_ADDRESS),
                    //   wallet.publicKey,
                    //   newMission.goal * 10 ** 9,
                    //   9
                    // );
                    // console.log(`    ✅ - Burn Instruction Created`);
                    // // Step 3 - Fetch Blockhash
                    // console.log("Step 3 - Fetch Blockhash");
                    // const { blockhash, lastValidBlockHeight } =
                    //   await connection.getLatestBlockhash("finalized");
                    // console.log(`    ✅ - Latest Blockhash: ${blockhash}`);
                    // // Step 4 - Assemble Transaction
                    // console.log("Step 4 - Assemble Transaction");
                    // const messageV0 = new TransactionMessage({
                    //   payerKey: wallet.publicKey,
                    //   recentBlockhash: blockhash,
                    //   instructions: [burnIx],
                    // }).compileToV0Message();
                    // const transaction = new VersionedTransaction(messageV0);
                    // transaction.sign([wallet]);
                    // console.log(`    ✅ - Transaction Created and Signed`);
                    // // Step 5 - Execute & confirm transaction
                    // console.log("Step 5 - execute & confirm transaction");
                    // const txId = await connection.sendTransaction(transaction);
                    // console.log("    ✅ - Transaction sent to network");
                    // const confirmation = await connection.confirmTransaction({
                    //   signature: txId,
                    //   blockhash: blockhash,
                    //   lastValidBlockHeight: lastValidBlockHeight,
                    // });
                    // if (confirmation.value.err) {
                    //   throw new Error("❌ - Transaction not confirmed.");
                    // }
                    // console.log(
                    //   "🔥 SUCCESSFUL BURN!🔥",
                    //   "\n",
                    //   `https://explorer.solana.com/tx/${txId}`
                    // );
                    // Increase site balance
                    const updateSiteBalance = yield UserModel_1.default.findOneAndUpdate({ walletAddress: process.env.TREASURY_WALLET_ADDRESS }, { $inc: { tokenBalance: totalAmount * 0.8 } });
                    if (updateSiteBalance) {
                        res.json({ missionClosed: true });
                    }
                    else {
                        res.status(500).json({ err: "There is unexpected error!" });
                    }
                }
                else {
                    res.json({ newMission });
                }
            }
            else {
                res
                    .status(500)
                    .json({ treasuryTkAccount, destination, tokenMintAddress });
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
// @route    POST api/mission/addsolomission
// @desc     POST add solo mission
// @access   Private
MissionRouter.post("/addsolomission", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, content, goal } = req.body;
        const newMissionSchem = new SoloMissionModel_1.default({
            title: title,
            explanation: content,
            goal: goal,
        });
        yield newMissionSchem.save();
        res.json({ success: true });
    }
    catch (error) {
        console.log("add solo mission error", error);
        res.status(500).json({ err: error });
    }
}));
// @route    GET api/missions/solomissions/update
// @desc     GET get solo mission list
// @access   Private
MissionRouter.post("/solomissions/update", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { missionId, title, content, goal } = req.body;
        console.log("updating data => ", req.body);
        const mission = yield SoloMissionModel_1.default.findOne({ _id: missionId });
        if (!mission)
            return res.status(500).json({ err: "This mission does not exist!" });
        const updatedMission = yield SoloMissionModel_1.default.findOneAndUpdate({ _id: missionId }, {
            title: title,
            explanation: content,
            goal: goal,
        }, { new: true });
        console.log("updated mission => ", updatedMission);
        if (updatedMission) {
            res.json({ success: true });
        }
    }
    catch (error) {
        console.log("solo mission error", error);
        res.status(500).json({ err: error });
    }
}));
// @route    DELETE api/missions/solomissions/:missionId
// @desc     DELETE delete one mission
// @access   Private
MissionRouter.delete("/solomissions/:missionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { missionId } = req.params;
        const mission = yield SoloMissionModel_1.default.findOne({ _id: missionId });
        if (!mission)
            return res.status(500).json({ err: "This mission does not exist!" });
        yield SoloMissionModel_1.default.findOneAndDelete({ _id: missionId });
        res.json({ success: true });
    }
    catch (error) {
        console.log("solo mission error", error);
        res.status(500).json({ err: error });
    }
}));
// @route    GET api/mission/solomissions
// @desc     GET get solo mission list
// @access   Private
MissionRouter.get("/solomissions/:missionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { missionId } = req.params;
        const mission = yield SoloMissionModel_1.default.findOne({ _id: missionId });
        res.json({ mission });
    }
    catch (error) {
        console.log("solo mission error", error);
        res.status(500).json({ err: error });
    }
}));
MissionRouter.get("/solomissions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const missions = yield SoloMissionModel_1.default.find({});
        res.json({ missions });
    }
    catch (error) {
        console.log("solo missions error", error);
        res.status(500).json({ err: error });
    }
}));
// @route    POST api/mission/solomissions/burn
// @desc     POST burn in solo mission
// @access   Private
MissionRouter.post("/solomissions/burn", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { missionId, signature } = req.body;
        //@ts-ignore
        const { _id } = req.user;
        console.log("missionid => ", missionId);
        console.log("signature => ", signature);
        console.log("_id => ", _id);
        const user = yield UserModel_1.default.findById(_id);
        if (!user)
            return res
                .status(500)
                .json({ success: false, msg: "User does not exist!" });
        const isHistory = yield HistoryModel_1.default.findOne({ signature: signature });
        const mission = yield SoloMissionModel_1.default.findOne({ _id: missionId });
        if (!mission)
            return res.status(500).json({ err: "this mission does not exist!" });
        const goal = mission === null || mission === void 0 ? void 0 : mission.goal;
        if (isHistory)
            return res
                .status(500)
                .json({ err: "This signature is already registerd!" });
        try {
            const txDetails = yield getTransactionInfo(signature);
            //@ts-ignore
            const txType = txDetails.transaction.message.instructions[2].parsed.type;
            if (txType != "burnChecked")
                return res
                    .status(500)
                    .json({ err: "This transaction is not transaction for burn!" });
            const treasuryTkAccount = 
            //@ts-ignore
            txDetails.transaction.message.instructions[2].parsed.info.authority;
            //@ts-ignore
            const tokenMintAddress = (_b = txDetails.meta) === null || _b === void 0 ? void 0 : _b.postTokenBalances[0].mint;
            const amount = Number(
            //@ts-ignore
            txDetails.transaction.message.instructions[2].parsed.info
                .tokenAmount.amount) / 1000000000 * 1.25;
            if (treasuryTkAccount == user.walletAddress &&
                process.env.TOKEN_MINT_ADDRESS == tokenMintAddress) {
                try {
                    const userIndex = user.soloMissions.findIndex((mission) => {
                        return mission.missionId === missionId;
                    });
                    let missionCompleted = false;
                    console.log('burn amount => ', amount);
                    if (userIndex === -1) {
                        user.soloMissions.push({ missionId, amount });
                    }
                    else {
                        user.soloMissions[userIndex].amount += Number(amount);
                        console.log('new mission amount => ', user.soloMissions[userIndex].amount);
                        if (user.soloMissions[userIndex].amount >= goal) {
                            user.soloMissions[userIndex].amount = 0;
                            missionCompleted = true;
                        }
                    }
                    const newUser = yield user.save();
                    console.log('mission goal => ', goal);
                    console.log('new user => ', newUser);
                    const newHistory = new HistoryModel_1.default({
                        signature: signature,
                        type: "soloburn",
                        userId: _id,
                        amount: amount,
                    });
                    yield newHistory.save();
                    yield UserModel_1.default.findOneAndUpdate({ walletAddress: process.env.TREASURY_WALLET_ADDRESS }, { $inc: { tokenBalance: amount * 0.8 } });
                    res.json({ newUser, missionCompleted });
                }
                catch (error) {
                    console.log("solo burn error => ", error);
                    res.status(500).json({ err: error });
                }
            }
            else {
                res.status(500).json({ err: "Invalid signature" });
            }
        }
        catch (error) {
            console.log("solo mission error", error);
            res.status(500).json({ err: error });
        }
    }
    catch (error) {
        console.log("error", error);
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
