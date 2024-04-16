import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema({
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

const HistoryModal = mongoose.model("history", HistorySchema);

export default HistoryModal;
