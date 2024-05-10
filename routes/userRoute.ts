import { Request, Response, Router } from "express";
import jwt, { sign } from "jsonwebtoken";

import User from "../model/UserModel";
import { authMiddleware, AuthRequest } from "../middleware";
import { JWT_SECRET } from "../config";
import UserModel from "../model/UserModel";



// Create a new instance of the Express Router
const UserRouter = Router();

// @route    POST api/users/register
// @desc     Register user
// @access   Public
UserRouter.post("/register", async (req: Request, res: Response) => {
  const { walletAddress } = req.body;
  try {
    if(!walletAddress || walletAddress === "") return res.status(500).json({msg: "Please provide a wallet address"});
    const user = await User.findOne({walletAddress: walletAddress});
    if (user) {
      const payload = {
        walletAddress: user.walletAddress,
        id: user._id
      }
      const token = jwt.sign(payload, JWT_SECRET);
      res.json({token: token, user: user});
    } else {
      const newUser = new UserModel({
        walletAddress: walletAddress
      });
      
      const newuser = await newUser.save();
      const payload = {
        username: newuser.username,
        walletAddress: newuser.walletAddress,
        id: newuser._id
      }
      const token = jwt.sign(payload, JWT_SECRET);
  
      res.json({token: token, user: newuser})
    }
  } catch (error) {
    console.log("registering error => ", error);
    res.status(500).json({err: error})
  }
});


// @route    POST api/users/update
// @desc     Update user info
// @access   Public
UserRouter.post("/update", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.user;
  console.log('user id => ', id);
  console.log('user info => ', req.user)
  const { username } = req.body;
  try {
    const user = await UserModel.findById(id);
    if (!user) return res.status(500).json({err: "This user does not exist!"});
    const updateUser = await UserModel.findByIdAndUpdate(id, { username: username }, {new: true});
    
    res.json({user: updateUser});
    
  } catch (error) {
    console.log("updating user error => ", error);
    res.status(500).json({err: error})
  }
});

export default UserRouter;
