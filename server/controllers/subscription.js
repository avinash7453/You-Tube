import crypto from "crypto";
import Razorpay from "razorpay";
import mongoose from "mongoose";
import users from "../Modals/Auth.js";
import subscription from "../Modals/subscription.js";

export const PLANS = {
    bronze: { amount: 9900, label: "Bronze", benefits: "5 downloads/day, extended watch time" },
    silver: { amount: 19900, label: "Silver", benefits: "10 downloads/day, longer watch time, fewer ads" },
    gold: { amount: 39900, label: "Gold", benefits: "25 downloads/day, ad-free viewing, priority access" },
};

const getRazorpay = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

export const getPlans = (_req, res) => {
    return res.status(200).json(PLANS);
};

export const createOrder = async (req, res) => {
    const { userId, plan } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId) || !PLANS[plan]) {
        return res.status(400).json({ message: "A valid user and paid plan are required" });
    }
    const razorpay = getRazorpay();
    if (!razorpay) return res.status(503).json({ message: "Razorpay test keys are not configured" });

    try {
        const user = await users.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        const order = await razorpay.orders.create({
            amount: PLANS[plan].amount,
            currency: "INR",
            receipt: `sub_${userId}_${Date.now()}`,
            notes: { userId, plan },
        });
        return res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            plan,
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        console.error("Subscription order error:", error);
        return res.status(502).json({ message: "Unable to create payment order" });
    }
};

const sendConfirmationEmail = async (user, payment, plan) => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("SMTP is not configured; subscription confirmation email was not sent");
        return;
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
        to: user.email,
        subject: `Your yourtube ${PLANS[plan].label} subscription`,
        text: `Your ${PLANS[plan].label} plan is active. Payment ID: ${payment.razorpayPaymentId}. Amount: INR ${payment.amount / 100}.`,
    });
};

export const verifyPayment = async (req, res) => {
    const { userId, plan, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId) || !PLANS[plan] ||
        !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: "Incomplete payment details" });
    }
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
    const actual = Buffer.from(expectedSignature, "utf8");
    const received = Buffer.from(razorpay_signature, "utf8");
    if (!process.env.RAZORPAY_KEY_SECRET ||
        actual.length !== received.length ||
        !crypto.timingSafeEqual(actual, received)) {
        return res.status(400).json({ message: "Payment signature verification failed" });
    }
    try {
        const user = await users.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        const record = await subscription.create({
            userid: userId,
            plan,
            amount: PLANS[plan].amount,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
        });
        user.plan = plan;
        user.planStartedAt = new Date();
        await user.save();
        await sendConfirmationEmail(user, record, plan);
        return res.status(200).json({ success: true, user, subscription: record });
    } catch (error) {
        if (error?.code === 11000) return res.status(409).json({ message: "Payment has already been processed" });
        console.error("Subscription verification error:", error);
        return res.status(500).json({ message: "Unable to activate subscription" });
    }
};
