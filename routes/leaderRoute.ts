import { Request, Response, Router } from "express";
import UserModel from "../model/UserModel";


// Create a new instance of the Express Router
const LeaderBoardRouter = Router();

// @route    GET api/leaderboard/getinfo
// @desc     Get token info
// @access   Public


interface Rank {
    username: string;
    amount: number;
  }
LeaderBoardRouter.get('/getRank', async (req: Request, res: Response) => {
    try {
        let userlist: Rank[] = [];
        const rankUsers = await UserModel.find({}).sort({tokenBalance: -1});
        for (let i = 0; i < rankUsers.length; i++) {
            userlist.push({
                username: rankUsers[i].username,
                amount: rankUsers[i].tokenBalance
            })
        }
        res.json({rankUsers: userlist})
    } catch (error) {
        console.log("rank user error => ", error)
        res.status(500).json({success: false, msg: error});
    }

})



export default LeaderBoardRouter;
