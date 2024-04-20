import { Request, Response, Router } from "express";
import UserModel from "../model/UserModel";
import MissionModel from "../model/MissionModal";
import { authMiddleware } from "../middleware";
import mongoose from "mongoose";

import base58 from "bs58";

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
import HistoryModel from "../model/HistoryModel";

const connection = new Connection(
  process.env.RPC_ENDPOINT ? process.env.RPC_ENDPOINT : clusterApiUrl("devnet")
);

const wallet = Keypair.fromSecretKey(
  //@ts-ignore
  base58.decode(process.env.TREASURY_PRIVATE_KEY)
);

// Create a new instance of the Express Router
const MissionRouter = Router();

// @route    GET api/mission/getAll
// @desc     Get all missions
// @access   Public

MissionRouter.get("/getAll", async (req: Request, res: Response) => {
  try {
    const missions = await MissionModel.find({}).populate("users.userId");
    res.json({ missions });
  } catch (error) {
    console.log("get all missions error => ", error);
    res.status(500).json({ success: false, msg: error });
  }
});

MissionRouter.post("/addMission", async (req: Request, res: Response) => {
  try {
    const { title, content, goal } = req.body;

    const newMissionSchem = new MissionModel({
      title: title,
      explanation: content,
      goal: goal,
    });

    await newMissionSchem.save();
    res.json({ success: true });
  } catch (error) {
    console.log("saving new mission error ==> ", error);
    res.status(500).json({ err: error });
  }
});

// @route    GET api/mission/getOne/:missionId
// @desc     Get one mission
// @access   Private

MissionRouter.get("/getOne/:missionId", async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;
    const mission = await MissionModel.findById(missionId);
    if (mission) {
      let totalBurn = 0;
      for (let i = 0; i < mission.users.length; i++) {
        totalBurn += mission.users[i].amount;
      }

      res.json({ mission, totalBurn });
    } else {
      res.status(500).json({ err: "This mission does not exist!" });
    }
  } catch (error) {
    console.log("get one mission error ==> ", error);
    res.status(500).json({ err: error });
  }
});

// @route    POST api/mission/joinUser
// @desc     Post join new user
// @access   Private

MissionRouter.post(
  "/joinUser",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      //@ts-ignore
      const { _id } = req.user;
      const { amount, missionId, signature } = req.body;

      console.log("user id ", _id);
      console.log("amount ", amount);
      console.log("missionId ", missionId);
      console.log("signature", signature);

      const mission = await MissionModel.findById(missionId);

      if (!mission) {
        return res.status(500).json({ err: "This mission does not exist!" });
      }
      const userIndex = mission.users.findIndex((user: any) => {
        console.log("user object id ==> ", user.userId.toString());
        console.log("user object id ==> ", new mongoose.Types.ObjectId(_id));
        return user.userId.toString() === _id;
      });

      console.log("user index ==> ", userIndex);

      if (userIndex === -1) {
        mission.users.push({ userId: _id, amount: amount });
      } else {
        mission.users[userIndex].amount += Number(amount);
      }

      const newMission = await mission.save();

    //   const newHistory = new HistoryModel({
    //     type: "burn",
    //     signature: signature,
    //     userId: _id,
    //     amount: amount,
    //   });

    //   await newHistory.save();

    //   const user = await UserModel.findOne({ _id: _id });
    //   const currentBalance = user?.tokenBalance;
    //   await UserModel.updateOne(
    //     { _id: _id },
    //     { tokenBalance: currentBalance ? currentBalance : 0 + amount },
    //     { new: true }
    //   );

      const totalAmount = newMission.users.reduce(
        (sum: number, user: any) => sum + user.amount,
        0
      );
      console.log("total amount ==> ", totalAmount);
      if (newMission.goal <= totalAmount) {
        await MissionModel.findOneAndUpdate({ _id: missionId }, { state: 1 });
        /// token burn function here

        // Step 1 fetch associated token account address
        console.log("Step 1 0 Fetch Token Account");
        const account = await getAssociatedTokenAddress(
          //@ts-ignore
          new PublicKey(process.env.TOKEN_MINT_ADDRESS),
          wallet.publicKey
        );
        console.log(
          `    ✅ - Associated Token Account Address: ${account.toString()}`
        );

        // Step 2 Create Burn Instruction
        console.log("Step 2 - Crate Burn Instructions");
        const burnIx = createBurnCheckedInstruction(
          account,
          //@ts-ignore
          new PublicKey(process.env.TOKEN_MINT_ADDRESS),
          wallet.publicKey,
          newMission.goal * 10 ** 9,
          9
        );
        console.log(`    ✅ - Burn Instruction Created`);

        // Step 3 - Fetch Blockhash
        console.log("Step 3 - Fetch Blockhash");
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash("finalized");
        console.log(`    ✅ - Latest Blockhash: ${blockhash}`);

        // Step 4 - Assemble Transaction
        console.log("Step 4 - Assemble Transaction");
        const messageV0 = new TransactionMessage({
          payerKey: wallet.publicKey,
          recentBlockhash: blockhash,
          instructions: [burnIx],
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
          lastValidBlockHeight: lastValidBlockHeight,
        });

        if (confirmation.value.err) {
          throw new Error("❌ - Transaction not confirmed.");
        }
        console.log(
          "🔥 SUCCESSFUL BURN!🔥",
          "\n",
          `https://explorer.solana.com/tx/${txId}`
        );

        res.json({ missionClosed: true });
      } else {
        res.json({ newMission });
      }
    } catch (error) {
      console.log("/joinUser error => ", error);
      res.status(500).json({ err: error });
    }
  }
);

//@route    GET history
MissionRouter.get(
  "/getHistory/:missionId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { missionId } = req.params;
      //@ts-ignore
      const { _id } = req.user;
      const histories = await HistoryModel.find({
        missionId: missionId,
        userId: _id,
      });
      res.json({histories});
    } catch (error) {
        console.log("getting hostory error ==> ", error);
        res.status(500).json({err: error});
    }
  }
);

export default MissionRouter;
