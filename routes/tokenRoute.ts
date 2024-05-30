import { Request, Response, Router } from "express";
import jwt, { sign } from "jsonwebtoken";

import User from "../model/UserModel";
import { authMiddleware, AuthRequest } from "../middleware";
import { JWT_SECRET } from "../config";
import UserModel from "../model/UserModel";
import TokenModel from "../model/TokenModel";

// Create a new instance of the Express Router
const TokenRouter = Router();

// @route    POST api/tokens/create
// @desc     Token Creation
// @access   Public
TokenRouter.post("/create", async (req: Request, res: Response) => {
  const { name, address, decimal, symbol, avatar, decription, supply, marketcap, owner } = req.body;
  try {

    if(!name || !address || !decimal || !symbol || !avatar || !decription || !supply || !marketcap || !owner) return res.status(500).json({success: false, err: "Please provide exact values!"});

    const isOwner = await UserModel.findOne({_id: owner});
    if(!isOwner)  return res.status(500).json({success: false, err: "This user does not exist!"});
    const isToken = await TokenModel.findOne({address});
    if(isToken) return res.status(500).json({success: false, err: "This token already registered!"});

    const newTokenSchema = new TokenModel({
        name,
        address,
        decimal,
        symbol,
        avatar,
        decription,
        supply,
        marketcap,
        owner
    })

    const newToken = await newTokenSchema.save();

    res.json({success: true, token: newToken})

  } catch (error) {
    console.log("token creation error => ", error);
    res.status(500).json({err: error})
  }
});

// @route   POST api/tokens/buy
// @desc    Token 

export default TokenRouter;
