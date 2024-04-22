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
import jwt, { sign } from "jsonwebtoken";
import base58 from "bs58";

import User from "../model/UserModel";
import HistoryModel from "../model/HistoryModel";

import { authMiddleware, AuthRequest } from "../middleware";
import { JWT_SECRET } from "../config";

import {
  Connection,
  clusterApiUrl,
  Keypair,
} from "@solana/web3.js";

const connection = new Connection(
  process.env.RPC_ENDPOINT ? process.env.RPC_ENDPOINT : clusterApiUrl("devnet")
);

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


// Create a new instance of the Express Router
const UserRouter = Router();

// @route    POST api/users/register
// @desc     Register user
// @access   Public
UserRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { address } = req.body;
    const isUser = await validateWallet(address);
    if (isUser) {
      const user = await User.findOne({ walletAddress: address });
      const payload = {
        _id: user?._id,
        username: user?.username,
        walletAddress: user?.walletAddress,
        tokenBalance: user?.tokenBalance,
        role: user?.role,
        created_at: user?.created_at,
      };
      const token = jwt.sign(payload ? payload : {}, JWT_SECRET, {
        expiresIn: "7 days",
      });
      res.json({ success: true, token });
    } else {
      const newUserSchem = new User({
        walletAddress: address,
      });
      const newUser = await newUserSchem.save();
      const payload = {
        _id: newUser?._id,
        username: newUser?.username,
        walletAddress: newUser?.walletAddress,
        tokenBalance: newUser?.tokenBalance,
        role: newUser?.role,
        created_at: newUser?.created_at,
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7 days" });
      res.json({ success: true, token });
    }
  } catch (error) {
    console.log("Sign up error ===> ", error);
    res.status(500).json({ success: false, msg: error });
  }
});

// // @route    POST api/users/update
// // @route    Update user
// // @route    Private
UserRouter.post(
  "/update",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const { username } = req.body;
    try {
      //@ts-ignore
      const isUser = await validateWallet(req.user.walletAddress);
      if (!isUser)
        return res
          .status(500)
          .json({ success: false, msg: "This wallet does not exist" });
      //@ts-ignore
      const updatedUser = await User.findOneAndUpdate(
        { walletAddress: req.user.walletAddress },
        { username: username },
        { new: true }
      );

      if (updatedUser) {
        const payload = {
          _id: updatedUser?._id,
          walletAddress: updatedUser?.walletAddress,
          tokenBalance: updatedUser?.tokenBalance,
          role: updatedUser?.role,
          username: updatedUser.username,
          created_at: updatedUser?.created_at,
        };
        const token = jwt.sign(payload ? payload : {}, JWT_SECRET, {
          expiresIn: "7 days",
        });
        res.json({ success: true, token: token });
      }
    } catch (error) {
      console.log("Update user error ===> ", error);
      res.status(500).json({ success: false, msg: error });
    }
  }
);

// @route    POST api/users/burn
UserRouter.post("/burn", authMiddleware, async (req, res) => {
  const { signature } = req.body;
  //@ts-ignore
  const { _id } = req.user;
  const user = await User.findById(_id);
  if (!user)
    return res
      .status(500)
      .json({ success: false, msg: "User does not exist!" });

  const isHistory = await HistoryModel.findOne({ signature: signature });

  if (isHistory)
    return res
      .status(500)
      .json({ err: "This signature is already registerd!" });

  try {
    const txDetails = await getTransactionInfo(signature);
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
    const tokenMintAddress = txDetails.meta?.postTokenBalances[0].mint;
    const amount =
      Number(
        //@ts-ignore
        txDetails.transaction.message.instructions[2].parsed.info.tokenAmount
          .amount
      ) / 1000000000;

    if (
      treasuryTkAccount == user.walletAddress &&
      process.env.TOKEN_MINT_ADDRESS == tokenMintAddress
    ) {
      try {
        const updateUser = await User.findOneAndUpdate(
          { _id: _id },
          { tokenBalance: user.tokenBalance + Number(amount) },
          { new: true }
        );

        const newHistory = new HistoryModel({
          signature: signature,
          type: "burn",
          userId: _id,
          amount: amount,
        });

        await newHistory.save();

        const payload = {
          _id: updateUser?._id,
          username: updateUser?.username,
          walletAddress: updateUser?.walletAddress,
          tokenBalance: updateUser?.tokenBalance,
          role: updateUser?.role,
          created_at: updateUser?.created_at,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7 days" });
        res.json({ success: true, token: token, txDetails });
      } catch (error) {
        console.log("burn error => ", error);
        res.status(500).json({ err: error });
      }
    } else {
      res.status(500).json({ err: "Invald transaction" });
    }
  } catch (error) {
    console.log("invalid transaction ==> ", error);
    res.status(500).json({ err: "Invald transaction" });
  }
});

UserRouter.get("/recentburn", authMiddleware, async (req, res) => {
  //@ts-ignore
  const { _id } = req.user;
  try {
    const history = await HistoryModel.find({
      type: "burn",
      userId: _id,
    }).limit(10);
    console.log(history);
    res.json({ histories: history, success: true });
  } catch (error) {
    console.log("getting history error ==> ", error);
    res.status(500).json({ success: false, msg: error });
  }
});

export default UserRouter;
