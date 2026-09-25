import mongoose from "mongoose";

const commentschema = new mongoose.Schema(
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
    commentbody: { type: String },
    usercommented: { type: String },
    commentedon: { type: Date, default: Date.now },
    language: { type: String, default: "auto" },
    location: { type: String },
    showLocation: { type: Boolean, default: false },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    reports: [{
      userid: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
      reason: { type: String, default: "community report" },
      createdAt: { type: Date, default: Date.now },
    }],
    flagged: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("comment", commentschema);
