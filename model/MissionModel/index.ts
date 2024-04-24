import mongoose, { Types } from "mongoose";

const MissionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  goal: {
    type: Number,
    default: 100
  },
  users: [{
    userId: {
        type: Types.ObjectId,
        ref: 'user'
    },
    amount: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
  }],
  state: {
    type: Number,
    default: 0
  }
});

const MissionModel = mongoose.model("mission", MissionSchema);

export default MissionModel;
