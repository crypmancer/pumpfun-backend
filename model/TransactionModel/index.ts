import mongoose, { Types } from "mongoose";

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'buy' // create / buy / sell
  },
  token: {
    type: String,
    ref: 'token'
  },
  user: {
    type: String,
    ref: 'user'
  },
  signature: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const TransactionModel = mongoose.model("transaction", TransactionSchema);

export default TransactionModel;
