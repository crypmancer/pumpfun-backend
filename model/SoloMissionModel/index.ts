import mongoose, { Types } from "mongoose";

const SoloMissionSchema = new mongoose.Schema({
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
  state: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const SoloMissionModel = mongoose.model("solomission", SoloMissionSchema);

export default SoloMissionModel;
