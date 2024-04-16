"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Create a new instance of the Express Router
const LeaderBoardRouter = (0, express_1.Router)();
// @route    GET api/leaderboard/getinfo
// @desc     Get token info
// @access   Public
// LeaderBoardRouter.get('/getinfo/:tokenAddress', async (req: Request, res: Response) => {
//     const { tokenAddress } = req.params;
//     const metadataAddress = new PublicKey(tokenAddress);
//     const nftsmetadata:metadata.MetadataData[] = await metadata.Metadata.findDataByOwner(connection, metadataAddress);
// })
exports.default = LeaderBoardRouter;
