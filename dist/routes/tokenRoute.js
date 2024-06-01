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
const TradeModel_1 = __importDefault(require("../model/TradeModel"));
const tradeRoute_1 = require("./tradeRoute");
// Create a new instance of the Express Router
const TokenRouter = (0, express_1.Router)();
const connection = new web3_js_1.Connection(process.env.RPC_ENDPOINT ? process.env.RPC_ENDPOINT : (0, web3_js_1.clusterApiUrl)("devnet"));
// const program = new Program(idl as Idl, programId);
// @route    POST api/tokens/create
// @desc     Token Creation
// @access   Public
TokenRouter.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const { avatar, owner, signature, } = req.body;
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
        const txDetails = yield connection.getParsedTransaction(signature, 'confirmed');
        console.log('get signature', txDetails);
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
                avatar: avatar,
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
// @route   GET api/tokens/getAll
// @desc    Get all tokens
// @acess   Public
TokenRouter.get('/getAll', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('getting all tokens');
    try {
        const tokens = yield TokenModel_1.default.find({});
        let resTokens = [];
        for (let i = 0; i < tokens.length; i++) {
            const buy = yield TransactionModel_1.default.find({ type: 'buy', token: tokens[i].address });
            let buyCount = 0;
            if (buy)
                buyCount = buy.length;
            const sell = yield TransactionModel_1.default.find({ type: 'sell', token: tokens[i].address });
            let sellCount = 0;
            if (sell)
                sellCount = sell.length;
            const newData = {
                tokenSymbol: tokens[i].symbol,
                tokenImage: tokens[i].avatar,
                creator: tokens[i].owner,
                liquidity: tokens[i].supply,
                marketcap: tokens[i].marketcap,
                txnsBuy: buyCount,
                txnsSell: sellCount,
                tokenAddr: tokens[i].address,
                tokenName: tokens[i].name
            };
            resTokens.push(newData);
        }
        res.json({ success: true, tokens: resTokens });
    }
    catch (error) {
        console.log('get all => ', error);
        res.status(500).json({ success: false });
    }
}));
const sampleData = [
    { "timestamp": 1609459200000, "price": 109.48 },
    { "timestamp": 1609459201000, "price": 91.54 },
    { "timestamp": 1609459202000, "price": 108.32 },
    { "timestamp": 1609459203000, "price": 103.89 },
    { "timestamp": 1609459204000, "price": 93.47 },
    { "timestamp": 1609459205000, "price": 108.22 },
    { "timestamp": 1609459206000, "price": 96.21 },
    { "timestamp": 1609459207000, "price": 92.78 },
    { "timestamp": 1609459208000, "price": 103.66 },
    { "timestamp": 1609459209000, "price": 94.07 },
    { "timestamp": 1609459210000, "price": 90.08 },
    { "timestamp": 1609459211000, "price": 104.96 },
    { "timestamp": 1609459212000, "price": 100.84 },
    { "timestamp": 1609459213000, "price": 101.52 },
    { "timestamp": 1609459214000, "price": 100.27 },
    { "timestamp": 1609459215000, "price": 90.89 },
    { "timestamp": 1609459216000, "price": 109.13 },
    { "timestamp": 1609459217000, "price": 90.76 },
    { "timestamp": 1609459218000, "price": 94.21 },
    { "timestamp": 1609459219000, "price": 95.57 },
    { "timestamp": 1609459220000, "price": 108.96 },
    { "timestamp": 1609459221000, "price": 96.72 },
    { "timestamp": 1609459222000, "price": 90.29 },
    { "timestamp": 1609459223000, "price": 106.79 },
    { "timestamp": 1609459224000, "price": 103.88 },
    { "timestamp": 1609459225000, "price": 90.35 },
    { "timestamp": 1609459226000, "price": 92.81 },
    { "timestamp": 1609459227000, "price": 92.33 },
    { "timestamp": 1609459228000, "price": 100.87 },
    { "timestamp": 1609459229000, "price": 104.88 },
    { "timestamp": 1609459230000, "price": 91.47 },
    { "timestamp": 1609459231000, "price": 101.45 },
    { "timestamp": 1609459232000, "price": 103.45 },
    { "timestamp": 1609459233000, "price": 91.16 },
    { "timestamp": 1609459234000, "price": 96.75 },
    { "timestamp": 1609459235000, "price": 108.76 },
    { "timestamp": 1609459236000, "price": 91.58 },
    { "timestamp": 1609459237000, "price": 106.78 },
    { "timestamp": 1609459238000, "price": 109.68 },
    { "timestamp": 1609459239000, "price": 105.78 },
    { "timestamp": 1609459240000, "price": 106.05 },
    { "timestamp": 1609459241000, "price": 95.69 },
    { "timestamp": 1609459242000, "price": 109.24 },
    { "timestamp": 1609459243000, "price": 93.62 },
    { "timestamp": 1609459244000, "price": 92.06 },
    { "timestamp": 1609459245000, "price": 108.53 },
    { "timestamp": 1609459246000, "price": 105.14 },
    { "timestamp": 1609459247000, "price": 106.16 },
    { "timestamp": 1609459248000, "price": 104.22 },
    { "timestamp": 1609459249000, "price": 93.26 },
    { "timestamp": 1609459250000, "price": 95.33 },
    { "timestamp": 1609459251000, "price": 96.18 },
    { "timestamp": 1609459252000, "price": 97.89 },
    { "timestamp": 1609459253000, "price": 102.02 },
    { "timestamp": 1609459254000, "price": 90.13 },
    { "timestamp": 1609459255000, "price": 97.83 },
    { "timestamp": 1609459256000, "price": 104.86 },
    { "timestamp": 1609459257000, "price": 91.92 },
    { "timestamp": 1609459258000, "price": 94.76 },
    { "timestamp": 1609459259000, "price": 109.11 },
    { "timestamp": 1609459260000, "price": 92.23 },
    { "timestamp": 1609459261000, "price": 105.19 },
    { "timestamp": 1609459262000, "price": 104.96 },
    { "timestamp": 1609459263000, "price": 106.42 },
    { "timestamp": 1609459264000, "price": 105.67 },
    { "timestamp": 1609459265000, "price": 108.91 },
    { "timestamp": 1609459266000, "price": 109.28 },
    { "timestamp": 1609459267000, "price": 94.37 },
    { "timestamp": 1609459268000, "price": 98.75 },
    { "timestamp": 1609459269000, "price": 105.92 },
    { "timestamp": 1609459270000, "price": 109.96 },
    { "timestamp": 1609459271000, "price": 94.85 },
    { "timestamp": 1609459272000, "price": 92.88 },
    { "timestamp": 1609459273000, "price": 103.27 },
    { "timestamp": 1609459274000, "price": 102.38 },
    { "timestamp": 1609459275000, "price": 98.61 },
    { "timestamp": 1609459276000, "price": 100.99 },
    { "timestamp": 1609459277000, "price": 93.02 },
    { "timestamp": 1609459278000, "price": 104.89 },
    { "timestamp": 1609459279000, "price": 106.26 },
    { "timestamp": 1609459280000, "price": 98.73 },
    { "timestamp": 1609459281000, "price": 109.93 },
    { "timestamp": 1609459282000, "price": 108.61 },
    { "timestamp": 1609459283000, "price": 108.32 },
    { "timestamp": 1609459284000, "price": 100.69 },
    { "timestamp": 1609459285000, "price": 106.99 },
    { "timestamp": 1609459286000, "price": 103.18 },
    { "timestamp": 1609459287000, "price": 109.91 },
    { "timestamp": 1609459288000, "price": 106.25 },
    { "timestamp": 1609459289000, "price": 99.97 },
    { "timestamp": 1609459290000, "price": 107.09 },
    { "timestamp": 1609459291000, "price": 103.73 },
    { "timestamp": 1609459292000, "price": 100.12 },
    { "timestamp": 1609459293000, "price": 95.12 },
    { "timestamp": 1609459294000, "price": 92.09 },
    { "timestamp": 1609459295000, "price": 108.71 },
    { "timestamp": 1609459296000, "price": 104.95 },
    { "timestamp": 1609459297000, "price": 92.99 },
    { "timestamp": 1609459298000, "price": 91.56 },
    { "timestamp": 1609459299000, "price": 107.36 },
    { "timestamp": 1609459300000, "price": 98.03 },
    { "timestamp": 1609459301000, "price": 106.11 },
    { "timestamp": 1609459302000, "price": 90.73 },
    { "timestamp": 1609459303000, "price": 98.68 },
    { "timestamp": 1609459304000, "price": 95.31 },
    { "timestamp": 1609459305000, "price": 99.94 },
];
function processIntervals(data) {
    // Step 1: Sort the array by timestamp
    data.sort((a, b) => a.timestamp - b.timestamp);
    // Step 2: Initialize variables
    const intervalDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
    const result = [];
    let intervalStart = null;
    let intervalEnd = null;
    let startPrice = null;
    let endPrice = null;
    let maxPrice = -Infinity;
    let minPrice = Infinity;
    // Step 3: Process each entry in the sorted array
    data.forEach((entry, index) => {
        const currentTime = entry.timestamp;
        // Initialize interval start if not set
        if (intervalStart === null) {
            intervalStart = currentTime;
            startPrice = entry.price;
        }
        // Determine if the current entry is within the current interval
        if (currentTime < intervalStart + intervalDuration) {
            // Update end price and other statistics within the interval
            intervalEnd = currentTime;
            endPrice = entry.price;
            maxPrice = Math.max(maxPrice, entry.price);
            minPrice = Math.min(minPrice, entry.price);
        }
        else {
            // Push the previous interval's data to result
            result.push({
                open: startPrice,
                close: endPrice,
                high: maxPrice,
                low: minPrice,
                date: (0, tradeRoute_1.getCurrentFormattedDateTime)(currentTime)
            });
            // Reset for the new interval
            intervalStart = currentTime;
            startPrice = entry.price;
            intervalEnd = currentTime;
            endPrice = entry.price;
            maxPrice = entry.price;
            minPrice = entry.price;
        }
        // Handle the last entry to ensure it gets included
        if (index === data.length - 1) {
            result.push({
                open: startPrice,
                close: endPrice,
                high: maxPrice,
                low: minPrice,
                date: (0, tradeRoute_1.getCurrentFormattedDateTime)(currentTime)
            });
        }
    });
    return result;
}
// @route   GET api/tokens/:tokenId
// @desc    Get one tokens info
// @access  Public
TokenRouter.get('/:tokenId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tokenId } = req.params;
    const token = yield TokenModel_1.default.findOne({ address: tokenId });
    if (!token)
        return res.status(500).json({ success: false, err: "This token does not exist!" });
    const tradeHis = yield TradeModel_1.default.find({ token: tokenId });
    if (tradeHis.length === 0)
        return res.status(500).json({ success: false, err: "This token has no data!" });
    //@ts-ignore
    const newArr = processIntervals(tradeHis);
    console.log('new array => ', newArr);
    res.json({ trades: newArr });
}));
exports.default = TokenRouter;
