import mongoose, { Types } from "mongoose";

const TradeSchema = new mongoose.Schema({
  token: {
    type: Types.ObjectId,
    ref: 'token'
  },
  price: { 
    type: Number
  },
  timestap: {
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
