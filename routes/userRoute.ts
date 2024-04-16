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

import { Request, Response, Router } from "express";
import { check, validationResult } from "express-validator";
import { encode, decode } from "js-base64";
import { Error } from "mongoose";
import bcrypt from "bcryptjs";
import jwt, { sign } from "jsonwebtoken";
import base58 from "bs58";

import User from "../model/UserModel";
import HistoryModal from "../model/HistoryModel";

import { authMiddleware, AuthRequest } from "../middleware";
import { JWT_SECRET } from "../config";

import {
  Connection,
  clusterApiUrl,
  Keypair,
  SystemProgram,
  Transaction,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  createBurnCheckedInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import { IUser } from "../utils/types";

const connection = new Connection(clusterApiUrl("devnet"));

const wallet = Keypair.fromSecretKey(
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

async function generateUserToken(user: IUser) {
  const payload = {
    _id: user?._id,
    walletAddress: user?.walletAddress,
    tokenBalance: user?.tokenBalance,
    role: user?.role,
    created_at: user?.created_at
  }
  const token = jwt.sign(payload ? payload : {}, JWT_SECRET, { expiresIn: "7 days" });
  return token;
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
      const token = jwt.sign(payload ? payload : {}, JWT_SECRET, { expiresIn: "7 days" });
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
    res.status(500).json({ success: false, msg: error })
  }
});

// // @route    PUT api/users/update
// // @route    Update user
// // @route    Private
UserRouter.put('/update', authMiddleware, async (req:AuthRequest, res: Response) => {
  const { username } = req.body;
  console.log("token user ===> ", req.user)
  try {
    //@ts-ignore
    const isUser = await validateWallet(req.user.walletAddress);
    if(!isUser) return res.status(500).json({success: false, msg: "This wallet does not exist"});
    //@ts-ignore
    const updatedUser = await User.findOneAndUpdate({walletAddress: req.user.walletAddress}, {username: username}, {new: true});
    
    if (updatedUser) {
      const payload = {
        _id: updatedUser?._id,
        walletAddress: updatedUser?.walletAddress,
        tokenBalance: updatedUser?.tokenBalance,
        role: updatedUser?.role,
        created_at: updatedUser?.created_at
      };
      const token = jwt.sign(payload ? payload : {}, JWT_SECRET, { expiresIn: "7 days" });
      res.json({success: true, token: token })
    }
    
  } catch (error) {
    console.log('Update user error ===> ', error);
    res.status(500).json({success: false, msg: error})
  }
})

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
      if (!txDetails) {
        return res.status(500).json({ success: false, msg: "Invalid transaction! didnt get txhash" });
      } else {

        const treasuryTkAccount =
          //@ts-ignore
          txDetails.transaction.message.instructions[2].parsed.info.multisigAuthority;
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
              txDetails.transaction.message.instructions[2].parsed.info.tokenAmount.amount
            ) / 1000000000;
            //@ts-ignore
          const signExist = await HistoryModal.findOne({signature: signature});
          if (signExist) return res.status(500).json({success: false, msg: "This transaction is already registered!"})
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
          res.status(500).json({ success: false, msg: "Invalid transaction! cant confirm" });
        }
      }

    } catch (error) {
      console.log("deposit error ====> ", error);
      res.status(500).json({ success: false, msg: error });
    }
  }
);

// @route    POST api/users/withdraw
// @desc     Withdraw token
// @access   Private
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
        wallet.publicKey,
        withdrawAmount * 1000000000
      )
    );

    // Sign the transaction with the sender's keypair
    transaction.feePayer = wallet.publicKey;
    const recentBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;
    const simulator = await connection.simulateTransaction(transaction);
    const signedTransaction = await connection.sendTransaction(transaction, [
      wallet,
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
        const updatedUser = await User.updateOne({ walletAddress: walletAddress }, { tokenBalance: (isUser.tokenBalance - withdrawAmount)}, {new: true});
        const token = jwt.sign(updatedUser, JWT_SECRET, {
          expiresIn: "7 days",
        });
        if (updatedUser) {
          res.json({ updatedUser: token, success: true });
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
    res.status(500).json({ success: false, msg: error })
  }
});


// @route    POST api/users/token-burn
// @desc     Burning token
// @access   Private
UserRouter.post('/token-burn', authMiddleware, async (req, res) => {
  const { tokenMintAddress, amount, burnDecimal } = req.body;
  //@ts-ignore
  const { walletAddress } = req.user.walletAddress;
  const isuser = await validateWallet(walletAddress);
  if(!isuser) res.status(500).json({success: false, msg: "User does not exist!"})
  const user = await User.findOne({walletAddress: walletAddress});
  if(user && user?.tokenBalance < amount) return res.status(500).json({success: false, msg: "You don't have enough token to burn!"});
  try {
    // Step 1 fetch associated token account address
    console.log("Step 1 0 Fetch Token Account");
    //@ts-ignore
    const account = await getAssociatedTokenAddress(new PublicKey(process.env.TOKEN_MINT_ADDRESS), wallet.publicKey);
    console.log(`    ✅ - Associated Token Account Address: ${account.toString()}`);

    // Step 2 Create Burn Instruction
    console.log("Step 2 - Crate Burn Instructions");
    const burnIx = createBurnCheckedInstruction(
      account,
      //@ts-ignore
      new PublicKey(process.env.TOKEN_MINT_ADDRESS),
      wallet.publicKey,
      amount * (10 ** Number(burnDecimal)),
      burnDecimal
    )
    console.log(`    ✅ - Burn Instruction Created`);

    // Step 3 - Fetch Blockhash
    console.log("Step 3 - Fetch Blockhash")
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("finalized")
    console.log(`    ✅ - Latest Blockhash: ${blockhash}`);

    // Step 4 - Assemble Transaction
    console.log('Step 4 - Assemble Transaction');
    const messageV0 = new TransactionMessage({
      payerKey: wallet.publicKey,
      recentBlockhash: blockhash,
      instructions: [burnIx]
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([wallet]);
    console.log(`    ✅ - Transaction Created and Signed`);

    // Step 5 - Execute & confirm transaction
    console.log("Step 5 - execute & confirm transaction");
    const txId = await connection.sendTransaction(transaction);
    console.log("    ✅ - Transaction sent to network");

  const confirmation = await connection.confirmTransaction({
    signature: txId,
    blockhash: blockhash,
    lastValidBlockHeight: lastValidBlockHeight
  })

  if (confirmation.value.err) { throw new Error("    ❌ - Transaction not confirmed.") }
    console.log('🔥 SUCCESSFUL BURN!🔥', '\n', `https://explorer.solana.com/tx/${txId}?cluster=devnet`);

    res.json({success: true, msg: "Successfully burned!"})

  } catch (error) {
    console.log("Burning error ===> ", error);
    res.status(500).json({success: false, msg: error})
  }
})



export default UserRouter;
