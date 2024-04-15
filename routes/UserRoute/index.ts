import { Request, Response, Router } from "express";
import { check, validationResult } from "express-validator";
import { encode, decode } from "js-base64";
import { Error } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import base58 from "bs58";

import User from "../../model/UserModel";
import HistoryModal from "../../model/HistoryModal";

import { authMiddleware, AuthRequest } from "../../middleware";
import { JWT_SECRET } from "../../config";

import {
  Connection,
  clusterApiUrl,
  Keypair,
  SystemProgram,
  Transaction,
  PublicKey,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const connection = new Connection(clusterApiUrl("devnet"));

const senderKeypair = Keypair.fromSecretKey(
  //@ts-ignore
  base58.decode(process.env.TREASURY_PRIVATE_KEY)
);

async function validateWallet(walletAddress: string) {
  const user = await User.findOne({ walletAddress });
  if (user) return true;
    return false;
}

async function getTransactionInfo(signature: string) {
  const transactioninfo = await connection.getParsedTransaction(
    signature,
    "confirmed"
  );
  if (transactioninfo) {
    return transactioninfo;
  } else {
    return false;
  }
}

// Create a new instance of the Express Router
const UserRouter = Router();

// @route    POST api/users/register
// @desc     Register user
// @access   Public
UserRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { address } = req.body;
    const isUser = await validateWallet(address);
    console.log("isuser", isUser)
    if (isUser) {
      const user = await User.findOne({ walletAddress: address });
      const payload = {
        _id: user?._id,
        walletAddress: user?.walletAddress,
        tokenBalance: user?.tokenBalance,
        role: user?.role,
        created_at: user?.created_at
      };
      const token = jwt.sign(payload?payload:{}, JWT_SECRET, { expiresIn: "7 days" });
      res.json({ success: true, token });
    } else {
      const newUserSchem = new User({
        walletAddress: address,
      });
      const newUser = await newUserSchem.save();
      const payload = {
        _id: newUser?._id,
        walletAddress: newUser?.walletAddress,
        tokenBalance: newUser?.tokenBalance,
        role: newUser?.role,
        created_at: newUser?.created_at
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7 days" });
      res.json({ success: true, token });
    }
  } catch (error) {
    console.log("Sign up error ===> ", error);
    res.status(500).json({success: false, msg: error})
  }
});

// @route    POST api/users/deposit
// @desc     Deposit token
// @access   Private
UserRouter.post(
  "/deposit",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { tokenAddress, walletAddress, signature } = req.body;
    try {
      const isUser = await validateWallet(walletAddress);
      if (!isUser)
        return res
          .status(500)
          .json({ success: false, msg: "This wallet is not registered!" });
      const txDetails = await getTransactionInfo(signature);
      if (!txDetails)
        return res
          .status(500)
          .json({ success: false, msg: "Invalid transaction!" });

          const treasuryTkAccount =
          //@ts-ignore
        txDetails.transaction.message.instructions[2].parsed.info.authority;
        const destination =
        //@ts-ignore
        txDetails.transaction.message.instructions[2].parsed.info.destination;
      //@ts-ignore
      const tokenMintAddress = txDetails.meta?.postTokenBalances[0].mint;

      if (
        destination == process.env.TREASURY_TOKEN_ACCOUNT_ADDRESS &&
        treasuryTkAccount == walletAddress &&
        tokenAddress == tokenMintAddress
      ) {
        const amount =
        Number(
            //@ts-ignore
            txDetails.transaction.message.instructions[2].parsed.info.amount
          ) / 1000000000;
        const newTransaction = new HistoryModal({
          signature: signature,
        });
        await newTransaction.save();

        const user = await User.findOne({ walletAddress: walletAddress });
        const currentBalance = user?.tokenBalance;
        const updatedUser = await User.updateOne(
          { walletAddress: walletAddress },
          { tokenBalance: currentBalance ? currentBalance : 0 + amount },
          { new: true }
        );
        const token = jwt.sign(updatedUser, JWT_SECRET, {
          expiresIn: "7 days",
        });
        res.json({ success: true, token: token });
      } else {
        res.status(500).json({ success: false, msg: "Invalid transaction!" });
      }
    } catch (error) {
      console.log("deposit error ====> ", error);
      res.status(500).json({ success: false, msg: error });
    }
  }
);

UserRouter.post("/withdraw", authMiddleware, async (req, res) => {
  const { withdrawAmount, walletAddress } = req.body;
  
  try {
    const isUser = await User.findOne({ walletAddress: walletAddress });
    if (!isUser)
      return res
        .status(500)
        .json({ success: false, msg: "This wallet doesn't exist!" });
    if (isUser.tokenBalance < withdrawAmount)
      return res
        .status(500)
        .json({
          success: false,
          msg: "You don't have enough balance to withdraw!",
        });
    const userTokenAccount = await getAssociatedTokenAddress(
      //@ts-ignore
      new PublicKey(process.env.TOKEN_MINT_ADDRESS),
      new PublicKey(walletAddress)
    );

    

    const transaction = new Transaction().add(
      createTransferInstruction(
        //@ts-ignore
        new PublicKey(process.env.TREASURY_TOKEN_ACCOUNT_ADDRESS),
        userTokenAccount,
        senderKeypair.publicKey,
        withdrawAmount * 1000000000
      )
    );

    // Sign the transaction with the sender's keypair
    transaction.feePayer = senderKeypair.publicKey;
    const recentBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;
    const simulator = await connection.simulateTransaction(transaction);
    const signedTransaction = await connection.sendTransaction(transaction, [
      senderKeypair,
    ]);
    const tx = await connection.confirmTransaction(
      signedTransaction,
      "confirmed"
    );

    if (signedTransaction) {
      const newTransactin = new HistoryModal({
          signature: signedTransaction,
          type: 'withdraw'
      })

      const transactionResult = await newTransactin.save();

      if (transactionResult) {
          const updatedUser = await User.findOneAndUpdate({ walletAddress: walletAddress }, { balance: (isUser.tokenBalance - withdrawAmount) });
          if (updatedUser) {
              res.json({ updatedUser: updatedUser, success: true });
          } else {
              res.status(400).json({ err: "Transaction failed!" })
          }
      } else {
          res.status(400).json({ err: "Transaction failed!" })
      }
  } else {
      res.status(400).json({ err: "Transaction failed!" })
  }

  } catch (error) {
    console.log("Withdraw failed");
    res.status(500).json({success: false, msg: error})
  }
});

export default UserRouter;
