import mongoose, { Types } from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    default: function(){
      return Math.ceil(Math.random() * 1000000)
    },
    unique: true
  },
  walletAddress: { 
    type: String, 
    required: true,
    unique: true
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
  email: {
    type: String,
    default: ''
  },
  soloMissions: [
    {
      missionId: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        default: 0
      },
      state: {
        type: Number,
        default: 0  // first 0, complete: 1, burnt: 2
      }
    }
  ],
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
