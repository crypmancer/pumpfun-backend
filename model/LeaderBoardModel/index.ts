import mongoose from "mongoose";

const LeaderBoardModelSchema = new mongoose.Schema({
  token_name: {
    type: String,
    unique: true,
    required: true,
  },
  token_mint_address: {
    type: String,
    unique: true,
    required: true
  },
  token_avatar: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const LeaderBoardModel = mongoose.model("leaderboard", LeaderBoardModelSchema);

export default LeaderBoardModel;
