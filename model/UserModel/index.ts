import mongoose, { Types } from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    default: ""
  },
  walletAddress: { 
    type: String, 
    required: true,
    unique: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  tokens: [
    {
      token: {
        type: Types.ObjectId,
        ref: 'token'
      },
      amount: {
        type: Number,
        required: true
      }
    }
  ]
});

const UserModel = mongoose.model("user", UserSchema);

export default UserModel;
