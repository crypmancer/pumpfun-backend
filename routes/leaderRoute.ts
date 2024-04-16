import { Request, Response, Router } from "express";



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
