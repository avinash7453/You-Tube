import mongoose from "mongoose";
import users from "../Modals/Auth.js";
import crypto from "crypto";

const getLoginTheme = () => {
    const hour = Number(new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        hourCycle: "h23",
    }).format(new Date()));
    return hour >= 10 && hour < 12 ? "light" : "dark";
};

const sendOtp = async (email, otp) => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error("SMTP is not configured for OTP delivery");
    }
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: "Your yourtube security code",
        text: `Your yourtube verification code is ${otp}. It expires in 10 minutes.`,
    });
};

export const login = async (req, res) => {
    const { email, name, image, deviceId, region } = req.body;
    if (!email || !deviceId) return res.status(400).json({ message: "Email and device information are required" });
    try {
        const existinguser = await users.findOne({ email });
        if (!existinguser) {
            try {
                const newuser = await users.create({
                    email, name, image, theme: getLoginTheme(),
                    trustedDevices: [{ deviceId, region: region || "unknown" }],
                });
                return res.status(200).json({ result: newuser });
            } catch (error) {
                return res.status(500).json({ message: "something went wrong" });
            }
        } else {
            const knownDevice = existinguser.trustedDevices?.some((device) =>
                device.deviceId === deviceId && device.region === (region || "unknown"));
            if (!knownDevice && existinguser.trustedDevices?.length) {
                const otp = String(crypto.randomInt(100000, 1000000));
                existinguser.otpHash = crypto.createHash("sha256").update(otp).digest("hex");
                existinguser.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
                existinguser.pendingDeviceId = deviceId;
                existinguser.pendingRegion = region || "unknown";
                await existinguser.save();
                try {
                    await sendOtp(email, otp);
                } catch (error) {
                    existinguser.otpHash = undefined;
                    existinguser.otpExpiresAt = undefined;
                    existinguser.pendingDeviceId = undefined;
                    existinguser.pendingRegion = undefined;
                    await existinguser.save();
                    return res.status(503).json({ message: "Email OTP delivery is not configured" });
                }
                return res.status(202).json({ requiresOtp: true, userId: existinguser._id });
            }
            if (!existinguser.theme) existinguser.theme = getLoginTheme();
            if (!existinguser.trustedDevices?.length) {
                existinguser.trustedDevices = [{ deviceId, region: region || "unknown" }];
            }
            await existinguser.save();
            return res.status(200).json({ result: existinguser });
        }
    } catch (error) {
        return res.status(500).json({ message: "something went wrong" });
    }
};

export const verifyLoginOtp = async (req, res) => {
    const { userId, otp } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId) || !/^\d{6}$/.test(otp || "")) {
        return res.status(400).json({ message: "A valid verification code is required" });
    }
    try {
        const user = await users.findById(userId);
        const hash = crypto.createHash("sha256").update(otp).digest("hex");
        if (!user || !user.otpHash || user.otpHash !== hash || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }
        user.trustedDevices.push({
            deviceId: user.pendingDeviceId,
            region: user.pendingRegion || "unknown",
        });
        user.otpHash = undefined;
        user.otpExpiresAt = undefined;
        user.pendingDeviceId = undefined;
        user.pendingRegion = undefined;
        await user.save();
        return res.status(200).json({ result: user });
    } catch (error) {
        console.error("OTP verification error:", error);
        return res.status(500).json({ message: "Unable to verify login" });
    }
};

export const updateprofile = async (req, res) => {
    const { id } = req.params;
    const { channelname, description, theme } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: "user unavailable"
        });
    }
    
    try {
        const updatedata = await users.findByIdAndUpdate(
            id, 
            {
                $set: {
                    channelname: channelname,
                    description: description,
                    ...(theme === "light" || theme === "dark" ? { theme } : {}),
                },
            },
            { new: true }
        );
        
        if (!updatedata) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ result: updatedata });
    } catch (error) {
         console.error(error);
         return res.status(500).json({ message: "something went wrong" });
    }
};