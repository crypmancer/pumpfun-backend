import mongoose, { Types } from "mongoose";

const TradeSchema = new mongoose.Schema({
  token: {
    type: String,
    ref: 'token'
  },
  price: { 
    type: Number
  },
  timestamp: {
    type: String
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
