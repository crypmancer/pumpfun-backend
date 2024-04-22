"use strict";
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - address
 *       properties:
 *         address:
 *           type: string
 *           description: User wallet address
 *       example:
 *         address: 4BqSA7g71jgMzTJPJCsY6WriXd8xtMqzpaLeRppYPUWF
 *     UpdateUser:
 *       type: object
 *       required:
 *         - username
 *       properties:
 *         username:
 *           type: string
 *           description: Username
 *       example:
 *         username: subsuer
 *     Deposit:
 *       type: object
 *       required:
 *         - tokenAddress
 *         - walletAddress
 *         - signature
 *       properties:
 *         tokenAddress:
 *           type: string
 *           description: token mint address
 *         walletAddress:
 *           type: string
 *           description: wallet public key
 *         signature:
 *           type: string
 *           description: transaction signature
 *       example:
 *         tokenAddress: 4BqSA7g71jgMzTJPJCsY6WriXd8xtMqzpaLeRppYPUWF
 *         walletAddress: 4BqSA7g71jgMzTJPJCsY6WriXd8xtMqzpaLeRppYPUWF
 *         signature: 5z4BiXv2UQXGVTVq2zdqfnDUXwYZHP4qRmevDmawb66SgbYZgPGouLAda7xW4ZdhN7ZZ8JruruUzhbWL1kycfAXN
 *     Withdraw:
 *       type: object
 *       required:
 *         - withdrawAmount
 *         - walletAddress
 *       properties:
 *         withdrawAmount:
 *           type: number
 *           description: withdraw token amount
 *         walletAddress:
 *           type: string
 *           description: wallet public key
 *       example:
 *         withdrawAmount: 1000
 *         walletAddress: 4BqSA7g71jgMzTJPJCsY6WriXd8xtMqzpaLeRppYPUWF
 *     TokenBurn:
 *       type: object
 *       required:
 *         - tokenMintAddress
 *         - amount
 *         - burnDecimal
 *       properties:
 *         tokenMintAddress:
 *           type: string
 *           description: token mint address
 *         amount:
 *           type: number
 *           description: token amount
 *         burnDecimal:
 *           type: number
 *           description: decimal
 *       example:
 *         tokenMintAddress: 4BqSA7g71jgMzTJPJCsY6WriXd8xtMqzpaLeRppYPUWF
 *         amount: 10000
 *         burnDecimal: 9
 *     Response:
 *       type: object
 *       required:
 *         - success
 *       properties:
 *         success:
 *           type: boolean
 *           description: true or false
 *         msg:
 *           type: string
 *           description: string
 *         token:
 *           type: string,
 *           description: generated token
 *       example:
 *         success: true
 */
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
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The users managing API
 * /api/users/register:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Success? token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *       500:
 *         description: Some server error
 * /api/users/update:
 *   put:
 *     summary: Update user info
 *     tags: [Users]
 *     parameters:
 *      - in: header
 *        name: x-auth-token
 *        description: Encoded code for user security
 *        required: true
 *        schema:
 *          type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: Deposit token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *       500:
 *         description: Some server error
 * /api/users/deposit:
 *   post:
 *     summary: Deposit token
 *     tags: [Users]
 *     parameters:
 *      - in: header
 *        name: x-auth-token
 *        description: Encoded code for user security
 *        required: true
 *        schema:
 *          type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Deposit'
 *     responses:
 *       200:
 *         description: Deposit token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *       500:
 *         description: Some server error
 * /api/users/withdraw:
 *   post:
 *     summary: Withdraw token
 *     tags: [Users]
 *     parameters:
 *      - in: header
 *        name: x-auth-token
 *        description: Encoded code for user security
 *        required: true
 *        schema:
 *          type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Withdraw'
 *     responses:
 *       200:
 *         description: Withdraw token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *       500:
 *         description: Some server error
 * /api/users/token-burn:
 *   post:
 *     summary: token burn
 *     tags: [Users]
 *     parameters:
 *      - in: header
 *        name: x-auth-token
 *        description: Encoded code for user security
 *        required: true
 *        schema:
 *          type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TokenBurn'
 *     responses:
 *       200:
 *         description: Token burned.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *       500:
 *         description: Some server error
 */
const express_1 = require("express");
const mongoose_1 = require("mongoose");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bs58_1 = __importDefault(require("bs58"));
const UserModel_1 = __importDefault(require("../model/UserModel"));
const HistoryModel_1 = __importDefault(require("../model/HistoryModel"));
const middleware_1 = require("../middleware");
const config_1 = require("../config");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const connection = new web3_js_1.Connection(process.env.RPC_ENDPOINT ? process.env.RPC_ENDPOINT : (0, web3_js_1.clusterApiUrl)("devnet"));
const wallet = web3_js_1.Keypair.fromSecretKey(
//@ts-ignore
bs58_1.default.decode(process.env.TREASURY_PRIVATE_KEY));
function validateWallet(walletAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield UserModel_1.default.findOne({ walletAddress });
        if (user)
            return true;
        return false;
    });
}
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
function generateUserToken(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = {
            _id: user === null || user === void 0 ? void 0 : user._id,
            walletAddress: user === null || user === void 0 ? void 0 : user.walletAddress,
            tokenBalance: user === null || user === void 0 ? void 0 : user.tokenBalance,
            role: user === null || user === void 0 ? void 0 : user.role,
            created_at: user === null || user === void 0 ? void 0 : user.created_at,
        };
        const token = jsonwebtoken_1.default.sign(payload ? payload : {}, config_1.JWT_SECRET, {
            expiresIn: "7 days",
        });
        return token;
    });
}
// Create a new instance of the Express Router
const UserRouter = (0, express_1.Router)();
// @route    POST api/users/register
// @desc     Register user
// @access   Public
UserRouter.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { address } = req.body;
        const isUser = yield validateWallet(address);
        console.log("isuser", isUser);
        if (isUser) {
            const user = yield UserModel_1.default.findOne({ walletAddress: address });
            const payload = {
                _id: user === null || user === void 0 ? void 0 : user._id,
                username: user === null || user === void 0 ? void 0 : user.username,
                walletAddress: user === null || user === void 0 ? void 0 : user.walletAddress,
                tokenBalance: user === null || user === void 0 ? void 0 : user.tokenBalance,
                role: user === null || user === void 0 ? void 0 : user.role,
                created_at: user === null || user === void 0 ? void 0 : user.created_at,
            };
            const token = jsonwebtoken_1.default.sign(payload ? payload : {}, config_1.JWT_SECRET, {
                expiresIn: "7 days",
            });
            res.json({ success: true, token });
        }
        else {
            const newUserSchem = new UserModel_1.default({
                walletAddress: address,
            });
            const newUser = yield newUserSchem.save();
            const payload = {
                _id: newUser === null || newUser === void 0 ? void 0 : newUser._id,
                username: newUser === null || newUser === void 0 ? void 0 : newUser.username,
                walletAddress: newUser === null || newUser === void 0 ? void 0 : newUser.walletAddress,
                tokenBalance: newUser === null || newUser === void 0 ? void 0 : newUser.tokenBalance,
                role: newUser === null || newUser === void 0 ? void 0 : newUser.role,
                created_at: newUser === null || newUser === void 0 ? void 0 : newUser.created_at,
            };
            const token = jsonwebtoken_1.default.sign(payload, config_1.JWT_SECRET, { expiresIn: "7 days" });
            res.json({ success: true, token });
        }
    }
    catch (error) {
        console.log("Sign up error ===> ", error);
        res.status(500).json({ success: false, msg: error });
    }
}));
// // @route    PUT api/users/update
// // @route    Update user
// // @route    Private
UserRouter.put("/update", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    console.log("token user ===> ", req.user);
    try {
        //@ts-ignore
        const isUser = yield validateWallet(req.user.walletAddress);
        if (!isUser)
            return res
                .status(500)
                .json({ success: false, msg: "This wallet does not exist" });
        //@ts-ignore
        const updatedUser = yield UserModel_1.default.findOneAndUpdate({ walletAddress: req.user.walletAddress }, { username: username }, { new: true });
        if (updatedUser) {
            const payload = {
                _id: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser._id,
                walletAddress: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.walletAddress,
                tokenBalance: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.tokenBalance,
                role: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.role,
                username: updatedUser.username,
                created_at: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.created_at,
            };
            const token = jsonwebtoken_1.default.sign(payload ? payload : {}, config_1.JWT_SECRET, {
                expiresIn: "7 days",
            });
            res.json({ success: true, token: token });
        }
    }
    catch (error) {
        console.log("Update user error ===> ", error);
        res.status(500).json({ success: false, msg: error });
    }
}));
// @route    POST api/users/deposit
// @desc     Deposit token
// @access   Private
UserRouter.post("/deposit", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { tokenAddress, walletAddress, signature } = req.body;
    try {
        const isUser = yield validateWallet(walletAddress);
        if (!isUser)
            return res
                .status(500)
                .json({ success: false, msg: "This wallet is not registered!" });
        const txDetails = yield getTransactionInfo(signature);
        if (!txDetails) {
            return res.status(500).json({
                success: false,
                msg: "Invalid transaction! didnt get txhash",
            });
        }
        else {
            const treasuryTkAccount = 
            //@ts-ignore
            txDetails.transaction.message.instructions[2].parsed.info
                .multisigAuthority;
            const destination = 
            //@ts-ignore
            txDetails.transaction.message.instructions[2].parsed.info.destination;
            //@ts-ignore
            const tokenMintAddress = (_a = txDetails.meta) === null || _a === void 0 ? void 0 : _a.postTokenBalances[0].mint;
            if (destination == process.env.TREASURY_TOKEN_ACCOUNT_ADDRESS &&
                treasuryTkAccount == walletAddress &&
                tokenAddress == tokenMintAddress) {
                const amount = Number(
                //@ts-ignore
                txDetails.transaction.message.instructions[2].parsed.info
                    .tokenAmount.amount) / 1000000000;
                //@ts-ignore
                const signExist = yield HistoryModel_1.default.findOne({
                    signature: signature,
                });
                if (signExist)
                    return res.status(500).json({
                        success: false,
                        msg: "This transaction is already registered!",
                    });
                const newTransaction = new HistoryModel_1.default({
                    signature: signature,
                });
                yield newTransaction.save();
                const user = yield UserModel_1.default.findOne({ walletAddress: walletAddress });
                const currentBalance = user === null || user === void 0 ? void 0 : user.tokenBalance;
                const updatedUser = yield UserModel_1.default.updateOne({ walletAddress: walletAddress }, { tokenBalance: currentBalance ? currentBalance : 0 + amount }, { new: true });
                const token = jsonwebtoken_1.default.sign(updatedUser, config_1.JWT_SECRET, {
                    expiresIn: "7 days",
                });
                res.json({ success: true, token: token });
            }
            else {
                res
                    .status(500)
                    .json({ success: false, msg: "Invalid transaction! cant confirm" });
            }
        }
    }
    catch (error) {
        console.log("deposit error ====> ", error);
        res.status(500).json({ success: false, msg: error });
    }
}));
// @route    POST api/users/withdraw
// @desc     Withdraw token
// @access   Private
UserRouter.post("/withdraw", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { withdrawAmount, walletAddress } = req.body;
    try {
        const isUser = yield UserModel_1.default.findOne({ walletAddress: walletAddress });
        if (!isUser)
            return res
                .status(500)
                .json({ success: false, msg: "This wallet doesn't exist!" });
        if (isUser.tokenBalance < withdrawAmount)
            return res.status(500).json({
                success: false,
                msg: "You don't have enough balance to withdraw!",
            });
        const userTokenAccount = yield (0, spl_token_1.getAssociatedTokenAddress)(
        //@ts-ignore
        new web3_js_1.PublicKey(process.env.TOKEN_MINT_ADDRESS), new web3_js_1.PublicKey(walletAddress));
        const transaction = new web3_js_1.Transaction().add((0, spl_token_1.createTransferInstruction)(
        //@ts-ignore
        new web3_js_1.PublicKey(process.env.TREASURY_TOKEN_ACCOUNT_ADDRESS), userTokenAccount, wallet.publicKey, withdrawAmount * 1000000000));
        // Sign the transaction with the sender's keypair
        transaction.feePayer = wallet.publicKey;
        const recentBlockhash = yield connection.getLatestBlockhash();
        transaction.recentBlockhash = recentBlockhash.blockhash;
        const simulator = yield connection.simulateTransaction(transaction);
        const signedTransaction = yield connection.sendTransaction(transaction, [
            wallet,
        ]);
        const tx = yield connection.confirmTransaction(signedTransaction, "confirmed");
        if (signedTransaction) {
            const newTransactin = new HistoryModel_1.default({
                signature: signedTransaction,
                type: "withdraw",
            });
            const transactionResult = yield newTransactin.save();
            if (transactionResult) {
                const updatedUser = yield UserModel_1.default.updateOne({ walletAddress: walletAddress }, { tokenBalance: isUser.tokenBalance - withdrawAmount }, { new: true });
                const token = jsonwebtoken_1.default.sign(updatedUser, config_1.JWT_SECRET, {
                    expiresIn: "7 days",
                });
                if (updatedUser) {
                    res.json({ updatedUser: token, success: true });
                }
                else {
                    res.status(400).json({ err: "Transaction failed!" });
                }
            }
            else {
                res.status(400).json({ err: "Transaction failed!" });
            }
        }
        else {
            res.status(400).json({ err: "Transaction failed!" });
        }
    }
    catch (error) {
        console.log("Withdraw failed");
        res.status(500).json({ success: false, msg: error });
    }
}));
// @route    POST api/users/token-burn
// @desc     Burning token
// @access   Private
UserRouter.post("/token-burn", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tokenMintAddress, amount, burnDecimal } = req.body;
    //@ts-ignore
    const { walletAddress } = req.user.walletAddress;
    const isuser = yield validateWallet(walletAddress);
    if (!isuser)
        res.status(500).json({ success: false, msg: "User does not exist!" });
    const user = yield UserModel_1.default.findOne({ walletAddress: walletAddress });
    if (user && (user === null || user === void 0 ? void 0 : user.tokenBalance) < amount)
        return res
            .status(500)
            .json({ success: false, msg: "You don't have enough token to burn!" });
    try {
        // Step 1 fetch associated token account address
        console.log("Step 1 0 Fetch Token Account");
        const account = yield (0, spl_token_1.getAssociatedTokenAddress)(
        //@ts-ignore
        new web3_js_1.PublicKey(process.env.TOKEN_MINT_ADDRESS), wallet.publicKey);
        console.log(`    ✅ - Associated Token Account Address: ${account.toString()}`);
        // Step 2 Create Burn Instruction
        console.log("Step 2 - Crate Burn Instructions");
        const burnIx = (0, spl_token_1.createBurnCheckedInstruction)(account, 
        //@ts-ignore
        new web3_js_1.PublicKey(process.env.TOKEN_MINT_ADDRESS), wallet.publicKey, amount * Math.pow(10, Number(burnDecimal)), burnDecimal);
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
            throw new mongoose_1.Error("    ❌ - Transaction not confirmed.");
        }
        console.log("🔥 SUCCESSFUL BURN!🔥", "\n", `https://explorer.solana.com/tx/${txId}?cluster=devnet`);
        res.json({ success: true, msg: "Successfully burned!" });
    }
    catch (error) {
        console.log("Burning error ===> ", error);
        res.status(500).json({ success: false, msg: error });
    }
}));
// @route    POST api/users/burn
UserRouter.post("/burn", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { signature } = req.body;
    //@ts-ignore
    const { _id } = req.user;
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
        txDetails.transaction.message.instructions[2].parsed.info.tokenAmount
            .amount) / 1000000000;
        if (treasuryTkAccount == user.walletAddress &&
            process.env.TOKEN_MINT_ADDRESS == tokenMintAddress) {
            try {
                const updateUser = yield UserModel_1.default.findOneAndUpdate({ _id: _id }, { tokenBalance: user.tokenBalance + Number(amount) }, { new: true });
                const newHistory = new HistoryModel_1.default({
                    signature: signature,
                    type: "burn",
                    userId: _id,
                    amount: amount,
                });
                yield newHistory.save();
                const payload = {
                    _id: updateUser === null || updateUser === void 0 ? void 0 : updateUser._id,
                    username: updateUser === null || updateUser === void 0 ? void 0 : updateUser.username,
                    walletAddress: updateUser === null || updateUser === void 0 ? void 0 : updateUser.walletAddress,
                    tokenBalance: updateUser === null || updateUser === void 0 ? void 0 : updateUser.tokenBalance,
                    role: updateUser === null || updateUser === void 0 ? void 0 : updateUser.role,
                    created_at: updateUser === null || updateUser === void 0 ? void 0 : updateUser.created_at,
                };
                const token = jsonwebtoken_1.default.sign(payload, config_1.JWT_SECRET, { expiresIn: "7 days" });
                res.json({ success: true, token: token, txDetails });
            }
            catch (error) {
                console.log("burn error => ", error);
                res.status(500).json({ err: error });
            }
        }
        else {
            res.status(500).json({ err: "Invald transaction" });
        }
    }
    catch (error) {
        console.log("invalid transaction ==> ", error);
        res.status(500).json({ err: "Invald transaction" });
    }
}));
UserRouter.get("/recentburn", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const { _id } = req.user;
    try {
        const history = yield HistoryModel_1.default.find({
            type: "burn",
            userId: _id,
        }).limit(10);
        console.log(history);
        res.json({ histories: history, success: true });
    }
    catch (error) {
        console.log("getting history error ==> ", error);
        res.status(500).json({ success: false, msg: error });
    }
}));
exports.default = UserRouter;
