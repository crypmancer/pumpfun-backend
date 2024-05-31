import mongoose, { Types } from "mongoose";

const TokenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true,
    unique: true
  },
  decimal: {
    type: Number,
    default: 9
  },
  symbol: {
    type: String
  },
  avatar: {
    type: String
  },
  decription: {
    type: String
  },
  supply: {
    type: Number,
    default: 10 ** 9
  },
  marketcap: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0
  },
  owner: {
    type: String,
  }
});

const TokenModel = mongoose.model("token", TokenSchema);

export default TokenModel;
