import { Request, Response, Router } from "express";


import { authMiddleware, AuthRequest } from "../../middleware";
import { JWT_SECRET } from "../../config";

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


const connection = new Connection(clusterApiUrl("devnet"));

const wallet = Keypair.fromSecretKey(
  //@ts-ignore
  base58.decode(process.env.TREASURY_PRIVATE_KEY)
);



// Create a new instance of the Express Router
const LeaderBoardRouter = Router();

// @route    GET api/leaderboard/getinfo
// @desc     Get token info
// @access   Public
// LeaderBoardRouter.get('/getinfo/:tokenAddress', async (req: Request, res: Response) => {
//     const { tokenAddress } = req.params;
//     const metadataAddress = new PublicKey(tokenAddress);
//     const nftsmetadata:metadata.MetadataData[] = await metadata.Metadata.findDataByOwner(connection, metadataAddress);
    
// })



export default LeaderBoardRouter;
