
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
    type: String,
    default: "https://arweave.net/iap6ASZe2-Aw3tUFiuiCBS7DWtt0tlK2GNmn9ZVwXX8"
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
  buyvolume: {
    type: Number,
    default: 0
  },
  sellvolume: {
    type: Number,
    default: 0
  },
  owner: {
    type: String,
  }
});

const TokenModel = mongoose.model("token", TokenSchema);

export default TokenModel;
