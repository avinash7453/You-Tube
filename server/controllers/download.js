import path from "path";
import mongoose from "mongoose";
import users from "../Modals/Auth.js";
import video from "../Modals/video.js";
import download from "../Modals/download.js";

const getDailyLimit = (plan) =>
    ({ free: 1, bronze: 5, silver: 10, gold: 25 }[plan] || 1);

const startOfToday = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
};

export const requestDownload = async (req, res) => {
    const { videoId } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(videoId) || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "A valid user and video are required" });
    }

    try {
        const [user, targetVideo] = await Promise.all([
            users.findById(userId),
            video.findById(videoId),
        ]);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!targetVideo) return res.status(404).json({ message: "Video not found" });

        const plan = ["free", "bronze", "silver", "gold"].includes(user.plan) ? user.plan : "free";
        const usedToday = await download.countDocuments({
            userid: userId,
            downloadedon: { $gte: startOfToday() },
        });
        const limit = getDailyLimit(plan);
        if (usedToday >= limit) {
            return res.status(429).json({
                message: `Your ${plan} plan allows ${limit} downloads per day.`,
                plan,
                limit,
                used: usedToday,
            });
        }

        const filename = path.basename(targetVideo.filepath || targetVideo.filename);
        const record = await download.create({
            userid: userId,
            videoid: videoId,
            userPlan: plan,
            videotitle: targetVideo.videotitle,
            filename,
        });

        return res.status(200).json({
            download: true,
            downloadId: record._id,
            url: `/uploads/${encodeURIComponent(filename)}`,
            plan,
            used: usedToday + 1,
            remaining: limit - usedToday - 1,
        });
    } catch (error) {
        console.error("Download request error:", error);
        return res.status(500).json({ message: "Unable to start download" });
    }
};

export const getDownloads = async (req, res) => {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "A valid user is required" });
    }
    try {
        const downloads = await download.find({ userid: userId }).sort({ downloadedon: -1 });
        return res.status(200).json(downloads);
    } catch (error) {
        console.error("Download history error:", error);
        return res.status(500).json({ message: "Unable to load downloads" });
    }
};
