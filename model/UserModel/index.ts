import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    default: 'user',
  },
  walletAddress: { 
    type: String, 
    required: true, 
  },
  tokenBalance: {
    type: Number,
    default: 0,
  },
  avatar: { 
    type: String 
  },
  referrerId: { 
    type: String 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  role: { 
    type: Number, 
    default: 0 
  },
});

const UserModel = mongoose.model("user", UserSchema);

export default UserModel;
