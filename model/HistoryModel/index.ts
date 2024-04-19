import mongoose from "mongoose";

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
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  tokenAddress: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const HistoryModal = mongoose.model("history", HistorySchema);

export default HistoryModal;
