import mongoose, { Types } from "mongoose";

const HistorySchema = new mongoose.Schema({
  type: {
    type: String,
    default: "deposit" // deposit, withdraw, burn
  },
  signature: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: Types.ObjectId,
    required: true,
    ref: 'user'
  },
  amount: {
    type: Number,
    // required: true
  },
  missionId: {
    type: String
  },
  tokenAddress: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const HistoryModel = mongoose.model("history", HistorySchema);

export default HistoryModel;
