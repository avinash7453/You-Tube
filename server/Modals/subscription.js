import mongoose from "mongoose";

const subscriptionschema = new mongoose.Schema(
  {
    userid: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    plan: { type: String, enum: ["bronze", "silver", "gold"], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, required: true, unique: true },
    razorpaySignature: { type: String, required: true },
    status: { type: String, enum: ["paid"], default: "paid" },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("subscription", subscriptionschema);
