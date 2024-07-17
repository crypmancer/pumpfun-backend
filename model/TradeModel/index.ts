import mongoose, { Types } from "mongoose";

const TradeSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  price: { 
    type: Number,
    default: 0
  },
  timestamp: {
    type: Number
  },
  volume: {
    type: Number,
  },
  supply: {
    type: Number
  }
});

const TradeModel = mongoose.model("trade", TradeSchema);

export default TradeModel;