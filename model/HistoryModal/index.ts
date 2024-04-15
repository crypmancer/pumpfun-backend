import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema({
  type: {
    type: String,
    default: "deposit" // deposit, withdraw, burn
  },
  signature: {
    type: String,
    require: true,
    unique: true
  },
  tokenAddress: {
    type: String
  }

});

const HistoryModal = mongoose.model("history", HistorySchema);

export default HistoryModal;
