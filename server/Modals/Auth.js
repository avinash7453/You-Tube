import mongoose from "mongoose";

const userschema = new mongoose.Schema({
    email: { type: String, required: true },
    name: { type: String },
    channelname: { type: String },
    description: { type: String },
    image: { type: String },
    plan: { type: String, enum: ["free", "bronze", "silver", "gold"], default: "free" },
    planStartedAt: { type: Date },
    theme: { type: String, enum: ["light", "dark"], default: null },
    trustedDevices: [{
        deviceId: { type: String, required: true },
        region: { type: String, default: "unknown" },
        addedAt: { type: Date, default: Date.now },
    }],
    otpHash: { type: String },
    otpExpiresAt: { type: Date },
    pendingDeviceId: { type: String },
    pendingRegion: { type: String },
    joinedon: { type: Date, default: Date.now }
});

export default mongoose.model("user", userschema);