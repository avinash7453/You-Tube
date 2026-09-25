import mongoose from "mongoose";

const downloadschema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    videoid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },
    userPlan: {
      type: String,
      enum: ["free", "bronze", "silver", "gold"],
      default: "free",
    },
    videotitle: { type: String, required: true },
    filename: { type: String, required: true },
    downloadedon: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("download", downloadschema);
