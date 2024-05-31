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
const web3_js_1 = require("@solana/web3.js");
const UserModel_1 = __importDefault(require("../model/UserModel"));
const TokenModel_1 = __importDefault(require("../model/TokenModel"));
const TransactionModel_1 = __importDefault(require("../model/TransactionModel"));
const getInfo_1 = require("../utils/getInfo");
const config_1 = require("../contract/config");
const spl_token_1 = require("@solana/spl-token");
// Create a new instance of the Express Router
const TokenRouter = (0, express_1.Router)();
const connection = new web3_js_1.Connection(process.env.RPC_ENDPOINT ? process.env.RPC_ENDPOINT : (0, web3_js_1.clusterApiUrl)("devnet"));
// const program = new Program(idl as Idl, programId);
// @route    POST api/tokens/create
// @desc     Token Creation
// @access   Public
TokenRouter.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    const { name, address, decimal, symbol, avatar, decription, supply, marketcap, owner, signature, } = req.body;
    try {
        // if(!name || !address || !decimal || !symbol || !avatar || !decription || !supply || !marketcap || !owner) return res.status(500).json({success: false, err: "Please provide exact values!"});
        const isTransaction = yield TransactionModel_1.default.findOne({
            signature: signature,
        });
        if (isTransaction)
            return res
                .status(500)
                .json({ success: false, err: "This signature already used!" });
        const isOwner = yield UserModel_1.default.findOne({ walletAddress: owner });
        if (!isOwner)
            return res
                .status(500)
                .json({ success: false, err: "This user does not exist!" });
        const txDetails = yield connection.getParsedTransaction(signature);
        // console.log('get signature', txDetails)
        if (!txDetails)
            return res.status(500).json({ succss: false, err: "Invalid signature!" });
        try {
            //@ts-ignore
            const createdAccount = (_a = txDetails === null || txDetails === void 0 ? void 0 : txDetails.meta) === null || _a === void 0 ? void 0 : _a.innerInstructions[0].instructions[0].parsed;
            //@ts-ignore
            const createAtaAccount = (_b = txDetails === null || txDetails === void 0 ? void 0 : txDetails.meta) === null || _b === void 0 ? void 0 : _b.innerInstructions[0].instructions[1].parsed;
            //@ts-ignore
            const contractInitialized = (_c = txDetails === null || txDetails === void 0 ? void 0 : txDetails.meta) === null || _c === void 0 ? void 0 : _c.innerInstructions[0].instructions[5].parsed;
            //@ts-ignore
            const liquidityAdded = (_d = txDetails === null || txDetails === void 0 ? void 0 : txDetails.meta) === null || _d === void 0 ? void 0 : _d.innerInstructions[1].instructions[0].parsed;
            const tokenAddr = createAtaAccount.info.mint;
            const tokenPub = new web3_js_1.PublicKey(tokenAddr);
            let remaindTokenBalance = 0;
            let boughtTokenBalance = 0;
            let mintTokenOwnerBalance = 0;
            if (((_f = (_e = txDetails === null || txDetails === void 0 ? void 0 : txDetails.meta) === null || _e === void 0 ? void 0 : _e.innerInstructions) === null || _f === void 0 ? void 0 : _f.length) === 3) {
                //@ts-ignore
                remaindTokenBalance = (_g = txDetails.meta) === null || _g === void 0 ? void 0 : _g.postTokenBalances[0].uiTokenAmount.amount;
                //@ts-ignore
                boughtTokenBalance = (_h = txDetails.meta) === null || _h === void 0 ? void 0 : _h.innerInstructions[2].instructions[1].parsed.info.amount;
                //@ts-ignore
                mintTokenOwnerBalance = (_j = txDetails === null || txDetails === void 0 ? void 0 : txDetails.meta) === null || _j === void 0 ? void 0 : _j.innerInstructions[2].instructions[0].parsed.info.lamports;
            }
            else {
                //@ts-ignore
                remaindTokenBalance = (_k = txDetails.meta) === null || _k === void 0 ? void 0 : _k.postTokenBalances[0];
            }
            console.log("bought token amount => ", boughtTokenBalance);
            console.log("remaind token abount => ", remaindTokenBalance);
            console.log("pool sol balance", mintTokenOwnerBalance);
            console.log("token price => ", mintTokenOwnerBalance / remaindTokenBalance);
            // checkSocial(connection, )
            const tokenInfo = yield (0, getInfo_1.checkSocial)(connection, tokenPub, "confirmed");
            if (!tokenInfo.ok)
                return res
                    .status(500)
                    .json({ success: false, err: "This token does not exist!" });
            const newToken = new TokenModel_1.default({
                name: (_l = tokenInfo.data) === null || _l === void 0 ? void 0 : _l.name,
                address: tokenAddr,
                symbol: (_m = tokenInfo.data) === null || _m === void 0 ? void 0 : _m.symbol,
                avatar: (_o = tokenInfo.data) === null || _o === void 0 ? void 0 : _o.uri,
                //@ts-ignore
                description: tokenInfo.data.description,
                supply: remaindTokenBalance,
                marketcap: mintTokenOwnerBalance,
                price: mintTokenOwnerBalance / remaindTokenBalance,
                owner: owner,
            });
            yield newToken.save();
            let updatedUser;
            if (boughtTokenBalance != 0) {
                updatedUser = yield UserModel_1.default.findOneAndUpdate({ walletAddress: owner }, {
                    $push: {
                        tokens: { address: tokenAddr, amount: boughtTokenBalance },
                    },
                });
            }
            else {
                updatedUser = isOwner;
            }
            const newSchema = new TransactionModel_1.default({
                type: "create",
                tokne: tokenAddr,
                user: createdAccount.info.source,
                signature: signature,
            });
            yield newSchema.save();
            res.json({ success: true, signature: createdAccount.info.source });
        }
        catch (error) {
            console.log("creating token fetching info error => ", error);
            res.status(500).json({ succss: false, err: error, signature: txDetails });
        }
    }
    catch (error) {
        console.log("token creation error => ", error);
        res.status(500).json({ err: error, success: false });
    }
}));
// @route   POST api/tokens/buy
// @desc    Token Buy
// @access  Public
TokenRouter.post("/buy", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { buyer, token, amount, signature } = req.body;
    try {
        if (!buyer || !token || !amount || !signature)
            return res
                .status(500)
                .json({ success: false, err: "Please provide exact values!" });
        const isBuyer = yield UserModel_1.default.findOne({ walletAddress: buyer });
        if (!isBuyer)
            return res
                .status(500)
                .json({ success: false, err: "This user does not exist!" });
        const isToken = yield TokenModel_1.default.findOne({ address: token });
        if (!isToken)
            return res
                .status(500)
                .json({ success: false, err: "This token does not exist!" });
        const isTransaction = yield TransactionModel_1.default.findOne({
            signature: signature,
        });
        if (isTransaction)
            return res
                .status(500)
                .json({ success: false, err: "This signature already used!" });
        const tokenPub = new web3_js_1.PublicKey(token);
        const buyerPub = new web3_js_1.PublicKey(buyer);
        try {
            //-------------------calculating balance of my account-------------------//
            const mytokenAccount = yield (0, spl_token_1.getAssociatedTokenAddress)(tokenPub, buyerPub, true);
            const mytokenAccData = yield connection.getTokenAccountBalance(mytokenAccount);
            const mytokenAmount = mytokenAccData.value.uiAmount;
            const isMyToken = yield UserModel_1.default.findOne({
                walletAddress: buyer,
                "tokens.address": token,
            });
            let updatedUser;
            if (isMyToken) {
                updatedUser = yield UserModel_1.default.findOneAndUpdate({ walletAddress: buyer, "tokens.address": token }, { "tokens.$.amount": mytokenAmount });
            }
            else {
                updatedUser = yield UserModel_1.default.findOneAndUpdate({ walletAddress: buyer }, { $push: { tokens: { address: token, amount: mytokenAmount } } });
            }
            //-------------------calculating balance of pool account--------------------//
            const [poolPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(config_1.POOL_SEED_PREFIX), tokenPub.toBuffer()], config_1.programId);
            const poolToken = yield (0, spl_token_1.getAssociatedTokenAddress)(tokenPub, poolPda, true);
            const poolTokenBalance = yield connection.getTokenAccountBalance(poolToken);
            const [poolSolVault] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(config_1.SOL_VAULT_PREFIX), tokenPub.toBuffer()], config_1.programId);
            const poolSolBalance = yield connection.getBalance(poolSolVault);
            console.log("total token balance => ", poolTokenBalance.value.uiAmount);
            console.log("total sol balance =>", poolSolBalance / Math.pow(10, 9));
            const tokenPrice = poolSolBalance / Number(poolTokenBalance.value.amount);
            yield TokenModel_1.default.findOneAndUpdate({ address: token }, {
                marketcap: poolSolBalance,
                supply: poolTokenBalance.value.amount,
                price: tokenPrice,
            });
            const newTransactionSchema = new TransactionModel_1.default({
                type: "buy",
                token: token,
                user: buyer,
                signature: signature,
            });
            yield newTransactionSchema.save();
            res.json({ success: true, user: updatedUser });
        }
        catch (error) {
            console.log("buy unexpected error => ", error);
            res.status(500).json({ success: false, err: "Unexpected error occurd!" });
        }
    }
    catch (error) {
        console.log("token buying error => ", error);
        res.status(500).json({ success: false, err: error });
    }
}));
// @route   POST api/tokens/sell
// @desc    Token sell
// @access  Public
TokenRouter.post("/sell", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { seller, token, amount, signature } = req.body;
    try {
        if (!seller || !token || !amount)
            return res
                .status(500)
                .json({ success: false, err: "Please provide exact values!" });
        const isSeller = yield UserModel_1.default.findOne({ walletAddress: seller });
        if (!isSeller)
            return res
                .status(500)
                .json({ success: false, err: "This user does not exist!" });
        const isToken = yield TokenModel_1.default.findOne({ address: token });
        if (!isToken)
            return res
                .status(500)
                .json({ success: false, err: "This token does not exist!" });
        const isTransaction = yield TransactionModel_1.default.findOne({
            signature: signature,
        });
        if (isTransaction)
            return res
                .status(500)
                .json({ success: false, err: "This signature already used!" });
        const tokenPub = new web3_js_1.PublicKey(token);
        const sellerPub = new web3_js_1.PublicKey(seller);
        try {
            //-------------------calculating balance of my account-------------------//
            const mytokenAccount = yield (0, spl_token_1.getAssociatedTokenAddress)(tokenPub, sellerPub, true);
            const mytokenAccData = yield connection.getTokenAccountBalance(mytokenAccount);
            const mytokenAmount = mytokenAccData.value.uiAmount;
            const isMyToken = yield UserModel_1.default.findOne({
                walletAddress: seller,
                "tokens.address": token,
            });
            let updatedUser;
            if (isMyToken) {
                updatedUser = yield UserModel_1.default.findOneAndUpdate({ walletAddress: seller, "tokens.address": token }, { "tokens.$.amount": mytokenAmount });
            }
            else {
                updatedUser = yield UserModel_1.default.findOneAndUpdate({ walletAddress: seller }, { $push: { tokens: { address: token, amount: mytokenAmount } } });
            }
            //-------------------calculating balance of pool account--------------------//
            const [poolPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(config_1.POOL_SEED_PREFIX), tokenPub.toBuffer()], config_1.programId);
            const poolToken = yield (0, spl_token_1.getAssociatedTokenAddress)(tokenPub, poolPda, true);
            const poolTokenBalance = yield connection.getTokenAccountBalance(poolToken);
            const [poolSolVault] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(config_1.SOL_VAULT_PREFIX), tokenPub.toBuffer()], config_1.programId);
            const poolSolBalance = yield connection.getBalance(poolSolVault);
            console.log("total token balance => ", poolTokenBalance.value.uiAmount);
            console.log("total sol balance =>", poolSolBalance / Math.pow(10, 9));
            const tokenPrice = poolSolBalance / Number(poolTokenBalance.value.amount);
            yield TokenModel_1.default.findOneAndUpdate({ address: token }, {
                marketcap: poolSolBalance,
                supply: poolTokenBalance.value.amount,
                price: tokenPrice,
            });
            const newTransactionSchema = new TransactionModel_1.default({
                type: "buy",
                token: token,
                user: seller,
                signature: signature,
            });
            yield newTransactionSchema.save();
            res.json({ success: true, user: updatedUser });
        }
        catch (error) {
            console.log("buy unexpected error => ", error);
            res.status(500).json({ success: false, err: "Unexpected error occurd!" });
        }
    }
    catch (error) {
        console.log("token selling error => ", error);
        res.status(500).json({ success: false, err: error });
    }
}));
exports.default = TokenRouter;
