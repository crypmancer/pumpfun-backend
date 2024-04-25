import mongoose, { Types } from "mongoose";

const NotificationSchem = new mongoose.Schema({
  notiType: {
    type: String,
    default: "multimission"
  },
  userId: {
    type: String,
  },
  status: {
    type: Boolean,
    default: false
  },
  missionId: {
    type: Types.ObjectId,
    ref: 'mission'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const NotificationModel = mongoose.model("notification", NotificationSchem);

export default NotificationModel;
