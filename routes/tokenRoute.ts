import { Request, Response, Router } from "express";
import jwt, { sign } from "jsonwebtoken";

import User from "../model/UserModel";
import { authMiddleware, AuthRequest } from "../middleware";
import { JWT_SECRET } from "../config";

import { clusterApiUrl, Connection, PublicKey, Transaction } from "@solana/web3.js";

import UserModel from "../model/UserModel";
import TokenModel from "../model/TokenModel";
import TransactionModel from "../model/TransactionModel";
import { checkSocial, fetchImage } from "../utils/getInfo";
import { Idl, Program } from "@coral-xyz/anchor";
import {
  idl,
  POOL_SEED_PREFIX,
  programId,
  SOL_VAULT_PREFIX,
} from "../contract/config";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import TradeModel from "../model/TradeModel";
import { getCurrentFormattedDateTime } from "./tradeRoute";


// Create a new instance of the Express Router
const TokenRouter = Router();

const connection = new Connection(
  process.env.RPC_ENDPOINT ? process.env.RPC_ENDPOINT : clusterApiUrl("devnet")
);

// const program = new Program(idl as Idl, programId);

// @route    POST api/tokens/create
// @desc     Token Creation
// @access   Public
TokenRouter.post("/create", async (req: Request, res: Response) => {
  const {
    avatar,
    owner,
    signature,
  } = req.body;
  console.log('creating token => ....')
  try {
    // if(!name || !address || !decimal || !symbol || !avatar || !decription || !supply || !marketcap || !owner) return res.status(500).json({success: false, err: "Please provide exact values!"});

    const isTransaction = await TransactionModel.findOne({
      signature: signature,
    });
    if (isTransaction)
      return res
        .status(500)
        .json({ success: false, err: "This signature already used!" });

    const isOwner = await UserModel.findOne({ walletAddress: owner });
    if (!isOwner)
      return res
        .status(500)
        .json({ success: false, err: "This user does not exist!" });
    const txDetails = await connection.getParsedTransaction(signature, 'confirmed');
    console.log('get signature', txDetails)
    if (!txDetails)
      return res.status(500).json({ succss: false, err: "Invalid signature!" });

    try {
      //@ts-ignore
      const createdAccount = txDetails?.meta?.innerInstructions[0].instructions[0].parsed;
      //@ts-ignore
      const createAtaAccount = txDetails?.meta?.innerInstructions[0].instructions[1].parsed;
      //@ts-ignore
      const contractInitialized = txDetails?.meta?.innerInstructions[0].instructions[5].parsed;
      //@ts-ignore
      const liquidityAdded = txDetails?.meta?.innerInstructions[1].instructions[0].parsed;

      const tokenAddr = createAtaAccount.info.mint;
      const tokenPub = new PublicKey(tokenAddr);

      let remaindTokenBalance = 0;
      let boughtTokenBalance = 0;
      let mintTokenOwnerBalance = 0;
      if (txDetails?.meta?.innerInstructions?.length === 3) {
        //@ts-ignore
        remaindTokenBalance = txDetails.meta?.postTokenBalances[0].uiTokenAmount.amount;
        //@ts-ignore
        boughtTokenBalance = txDetails.meta?.innerInstructions[2].instructions[1].parsed.info.amount;
        //@ts-ignore
        mintTokenOwnerBalance = txDetails?.meta?.innerInstructions[2].instructions[0].parsed.info.lamports;
      } else {
        //@ts-ignore
        remaindTokenBalance = txDetails.meta?.postTokenBalances[0].uiTokenAmount.amount;
      }

      console.log("bought token amount => ", boughtTokenBalance);
      console.log("remaind token abount => ", remaindTokenBalance);
      console.log("pool sol balance", mintTokenOwnerBalance);

      console.log(
        "token price => ",
        mintTokenOwnerBalance / remaindTokenBalance
      );

      // checkSocial(connection, )

      const tokenInfo = await checkSocial(connection, tokenPub, "confirmed");
      if (!tokenInfo.ok)
        return res
          .status(500)
          .json({ success: false, err: "This token does not exist!" });
          
      //@ts-ignore
      const getAvatar = await fetchImage(tokenInfo.data?.uri);
      console.log('getavatar => ', getAvatar)

      const newToken = new TokenModel({
        name: tokenInfo.data?.name,
        address: tokenAddr,
        symbol: tokenInfo.data?.symbol,
        avatar: getAvatar,
        //@ts-ignore
        description: tokenInfo.data.description,
        supply: remaindTokenBalance,
        marketcap: mintTokenOwnerBalance,
        price: mintTokenOwnerBalance / remaindTokenBalance,
        owner: owner,
      });

      await newToken.save();

      let updatedUser;
      if (boughtTokenBalance != 0) {
        updatedUser = await UserModel.findOneAndUpdate(
          { walletAddress: owner },
          {
            $push: {
              tokens: { address: tokenAddr, amount: boughtTokenBalance },
            },
          }
        );
      } else {
        updatedUser = isOwner;
      }

      const newSchema = new TransactionModel({
        type: "create",
        tokne: tokenAddr,
        user: createdAccount.info.source,
        signature: signature,
      });

      await newSchema.save();

      res.json({ success: true, signature: createdAccount.info.source });
    } catch (error) {
      console.log("creating token fetching info error => ", error);
      res.status(500).json({ succss: false, err: error, signature: txDetails });
    }
  } catch (error) {
    console.log("token creation error => ", error);
    res.status(500).json({ err: error, success: false });
  }
});

// @route   POST api/tokens/buy
// @desc    Token Buy
// @access  Public
TokenRouter.post("/buy", async (req: Request, res: Response) => {
  const { buyer, token, amount, signature } = req.body;
  try {
    if (!buyer || !token || !amount || !signature)
      return res
        .status(500)
        .json({ success: false, err: "Please provide exact values!" });
    const isBuyer = await UserModel.findOne({ walletAddress: buyer });
    if (!isBuyer)
      return res
        .status(500)
        .json({ success: false, err: "This user does not exist!" });
    const isToken = await TokenModel.findOne({ address: token });
    if (!isToken)
      return res
        .status(500)
        .json({ success: false, err: "This token does not exist!" });
    const isTransaction = await TransactionModel.findOne({
      signature: signature,
    });
    if (isTransaction)
      return res
        .status(500)
        .json({ success: false, err: "This signature already used!" });


    const tokenPub = new PublicKey(token);
    const buyerPub = new PublicKey(buyer);

    try {
      //-------------------calculating balance of my account-------------------//
      // const mytokenAccount = await getAssociatedTokenAddress(
      //   tokenPub,
      //   buyerPub,
      //   true
      // );
      // const mytokenAccData = await connection.getTokenAccountBalance(
      //   mytokenAccount
      // );
      // const mytokenAmount = mytokenAccData.value.uiAmount;

      // // const txDetails = await connection.getParsedTransaction(signature, 'confirmed');
   
      // // //@ts-ignore
      // // console.log('buy tx details => ', txDetails?.meta?.innerInstructions[0].instructions[0].parsed.info.lamports);
      // // //@ts-ignore
      // // const solAmount = txDetails?.meta?.innerInstructions[0].instructions[0].parsed.info.lamports / 10 ** 9

      // const isMyToken = await UserModel.findOne({
      //   walletAddress: buyer,
      //   "tokens.address": token,
      // });

      // let updatedUser;
      // if (isMyToken) {
      //   updatedUser = await UserModel.findOneAndUpdate(
      //     { walletAddress: buyer, "tokens.address": token },
      //     { "tokens.$.amount": mytokenAmount }
      //   );
      // } else {
      //   updatedUser = await UserModel.findOneAndUpdate(
      //     { walletAddress: buyer },
      //     { $push: { tokens: { address: token, amount: mytokenAmount } } }
      //   );
      // }

      //-------------------calculating balance of pool account--------------------//
      const [poolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(POOL_SEED_PREFIX), tokenPub.toBuffer()],
        programId
      );
      const poolToken = await getAssociatedTokenAddress(
        tokenPub,
        poolPda,
        true
      );
      const poolTokenBalance = await connection.getTokenAccountBalance(
        poolToken
      );
      const [poolSolVault] = PublicKey.findProgramAddressSync(
        [Buffer.from(SOL_VAULT_PREFIX), tokenPub.toBuffer()],
        programId
      );
      const poolSolBalance = await connection.getBalance(poolSolVault);

      console.log("total token balance => ", poolTokenBalance.value.uiAmount);
      console.log("before sol balance =>", isToken.marketcap);
      console.log('amount => ', amount);
      console.log("resut => ", isToken.marketcap + Number(amount))

      const tokenPrice = poolSolBalance / Number(poolTokenBalance.value.amount);

      await TokenModel.findOneAndUpdate(
        { address: token },
        {
          marketcap: isToken.marketcap + Number(amount * 10 ** 9),
          supply: poolTokenBalance.value.amount,
          price: tokenPrice,
          buyvolume: (isToken.buyvolume?isToken.buyvolume:0) + Number(amount)
        }
      );

      const newTransactionSchema = new TransactionModel({
        type: "buy",
        token: token,
        user: buyer,
        signature: signature,
        amount: amount
      });

      await newTransactionSchema.save();

      res.json({ success: true });
    } catch (error) {
      console.log("buy unexpected error => ", error);
      res.status(500).json({ success: false, err: "Unexpected error occurd!" });
    }
  } catch (error) {
    console.log("token buying error => ", error);
    res.status(500).json({ success: false, err: error });
  }
});

// @route   POST api/tokens/sell
// @desc    Token sell
// @access  Public
TokenRouter.post("/sell", async (req: Request, res: Response) => {
  const { seller, token, amount, signature } = req.body;
  try {
    if (!seller || !token || !amount)
      return res
        .status(500)
        .json({ success: false, err: "Please provide exact values!" });
    const isSeller = await UserModel.findOne({ walletAddress: seller });
    if (!isSeller)
      return res
        .status(500)
        .json({ success: false, err: "This user does not exist!" });
    const isToken = await TokenModel.findOne({ address: token });
    if (!isToken)
      return res
        .status(500)
        .json({ success: false, err: "This token does not exist!" });
    const isTransaction = await TransactionModel.findOne({
      signature: signature,
    });
    if (isTransaction)
      return res
        .status(500)
        .json({ success: false, err: "This signature already used!" });

    const tokenPub = new PublicKey(token);
    const sellerPub = new PublicKey(seller);


    const txDetails = await connection.getParsedTransaction(signature, 'confirmed');
 
    //@ts-ignore
    console.log('buy tx details => ', txDetails?.meta?.innerInstructions[0].instructions[1].parsed.info.lamports);
    //@ts-ignore
    const solAmount = txDetails?.meta?.innerInstructions[0].instructions[1].parsed.info.lamports / 10 ** 9;

    console.log('sol amount => ', solAmount);


    try {
      //-------------------calculating balance of my account-------------------//
      // const mytokenAccount = await getAssociatedTokenAddress(
      //   tokenPub,
      //   sellerPub,
      //   true
      // );
      // const mytokenAccData = await connection.getTokenAccountBalance(
      //   mytokenAccount
      // );
      // const mytokenAmount = mytokenAccData.value.uiAmount;

      // const isMyToken = await UserModel.findOne({
      //   walletAddress: seller,
      //   "tokens.address": token,
      // });

      // let updatedUser;
      // if (isMyToken) {
      //   updatedUser = await UserModel.findOneAndUpdate(
      //     { walletAddress: seller, "tokens.address": token },
      //     { "tokens.$.amount": mytokenAmount }
      //   );
      // } else {
      //   updatedUser = await UserModel.findOneAndUpdate(
      //     { walletAddress: seller },
      //     { $push: { tokens: { address: token, amount: mytokenAmount } } }
      //   );
      // }

      //-------------------calculating balance of pool account--------------------//
      const [poolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(POOL_SEED_PREFIX), tokenPub.toBuffer()],
        programId
      );
      const poolToken = await getAssociatedTokenAddress(
        tokenPub,
        poolPda,
        true
      );
      const poolTokenBalance = await connection.getTokenAccountBalance(
        poolToken
      );
      const [poolSolVault] = PublicKey.findProgramAddressSync(
        [Buffer.from(SOL_VAULT_PREFIX), tokenPub.toBuffer()],
        programId
      );
      const poolSolBalance = await connection.getBalance(poolSolVault);

      console.log("total token balance => ", poolTokenBalance.value.uiAmount);
      console.log("total sol balance =>", poolSolBalance / 10 ** 9);

      const tokenPrice = poolSolBalance / Number(poolTokenBalance.value.amount);

      await TokenModel.findOneAndUpdate(
        { address: token },
        {
          marketcap: isToken.marketcap - Number(solAmount * 10 ** 9),
          supply: poolTokenBalance.value.amount,
          price: tokenPrice,
          sellvolume: (isToken.sellvolume?isToken.sellvolume:0) + Number(solAmount)
        }
      );

      const newTransactionSchema = new TransactionModel({
        type: "sell",
        token: token,
        user: seller,
        signature: signature,
        amount: solAmount
      });

      await newTransactionSchema.save();

      res.json({ success: true });
    } catch (error) {
      console.log("sell unexpected error => ", error);
      res.status(500).json({ success: false, err: "Unexpected error occurd!" });
    }
  } catch (error) {
    console.log("token selling error => ", error);
    res.status(500).json({ success: false, err: error });
  }
});

// @route   GET api/tokens/getAll
// @desc    Get all tokens
// @acess   Public
TokenRouter.get('/getAll', async (req: Request, res: Response) => {
  console.log('getting all tokens')
  try {
    const tokens = await TokenModel.find({});
    let resTokens = [];
    for (let i = 0; i < tokens.length; i++) {
      const buy = await TransactionModel.find({type: 'buy', token: tokens[i].address});
      let buyCount = 0;
      if(buy) buyCount = buy.length;
      const sell = await TransactionModel.find({type: 'sell', token: tokens[i].address});
      let sellCount = 0;
      if(sell) sellCount = sell.length;
      const newData = {
        tokenSymbol: tokens[i].symbol,
        tokenImage: tokens[i].avatar,
        creator: tokens[i].owner,
        liquidity: tokens[i].supply / 10 ** 9,
        marketcap: tokens[i].marketcap / 10 ** 9,
        txnsBuy: buyCount,
        txnsSell: sellCount,
        tokenAddr: tokens[i].address,
        tokenName: tokens[i].name,
        price: tokens[i].price,
        buyVolume: tokens[i].buyvolume?tokens[i].buyvolume:0,
        sellVolume: tokens[i].sellvolume?tokens[i].sellvolume:0
      }
      resTokens.push(newData);
    }
    res.json({success: true, tokens: resTokens})
  } catch (error) {
    console.log('get all => ', error);
    res.status(500).json({success: false})
  }
})

interface DataPoint {
  timestamp: number;
  price: number;
  token?: string;
  volume?: number
  supply?: number;
}

interface IntervalResult {
  open: number;
  close: number;
  high: number;
  low: number;
  date: string;
  volume: number
}


function processIntervals(data: DataPoint[]): IntervalResult[] {
  // Step 1: Sort the array by timestamp
  data.sort((a, b) => a.timestamp - b.timestamp);

  // Step 2: Initialize variables
  const intervalDuration = 20 * 1000; // 5 minutes in milliseconds
  const result: IntervalResult[] = [];
  let intervalStart: number | null = null;
  let intervalEnd: number | null = null;
  let startPrice: number | null = null;
  let endPrice: number | null = null;
  let maxPrice: number = -Infinity;
  let minPrice: number = Infinity;
  let lastClosePrice: number | null = null;

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
    } else {
      // Push the previous interval's data to result
      result.push({
        open: lastClosePrice!,
        close: endPrice!,
        high: maxPrice,
        low: minPrice,
        date: getCurrentFormattedDateTime(currentTime),
        volume: entry.volume!
      });
      lastClosePrice = endPrice

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
        open: startPrice!,
        close: endPrice!,
        high: maxPrice,
        low: minPrice,
        date: getCurrentFormattedDateTime(currentTime),
        volume: entry.volume!
      });
    }
  });

  return result;
}

// @route   GET api/tokens/:tokenId
// @desc    Get one tokens info
// @access  Public
TokenRouter.get('/:tokenId', async (req: Request, res: Response) => {
  const {tokenId} = req.params;
  const token = await TokenModel.findOne({address: tokenId});
  if(!token) return res.status(500).json({success: false, err: "This token does not exist!"});
  const tradeHis = await TradeModel.find({token: tokenId});
  if(tradeHis.length === 0) return res.status(500).json({success: false, err: "This token has no data!"});

  //@ts-ignore
  const newArr = processIntervals(tradeHis);
  res.json({trades: newArr, token})

})

export default TokenRouter;