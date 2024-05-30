import mongoose, { Types } from "mongoose";

const TokenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  decimal: {
    type: Number,
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
  },
  marketcap: {
    type: Number
  },
  owner: {
    type: Types.ObjectId,
    ref: 'user'
  }
});

const TokenModel = mongoose.model("token", TokenSchema);

export default TokenModel;
