import video from "../Modals/video.js";
import history from "../Modals/history.js";
import mongoose from "mongoose";

export const handlehistory = async (req, res) => {
    const { userId } = req.body;
    const { videoId } = req.params;
    try {
        const exisitinghistory = await history.findOne({
            viewer: userId,
            videoid: videoId,
        });
        if (exisitinghistory) {
            exisitinghistory.watchedon = new Date();
            await exisitinghistory.save();
            return res.status(200).json({ history: true, existing: true });
        } else {
            await history.create({ viewer: userId, videoid: videoId });
            await video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
            return res.status(200).json({ history: true });
        }
    } catch (error) {
        console.error("error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const handleview = async (req, res) => {
    const { videoId } = req.params;
    try {
        const targetVideo = await video.findById(videoId);
        if (!targetVideo) return res.status(404).json({ message: "Video not found" });
        targetVideo.views = Math.max(0, targetVideo.views || 0) + 1;
        await targetVideo.save();
        return res.status(200).json({ message: "View updated successfully" });
    } catch (error) {
        console.error("error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const getallhistoryVideo = async (req, res) => {
    const { userId } = req.params;
    try {
        const historyvideo = await history
            .find({ viewer: userId })
            .populate({
                path: "videoid",
                model: "videofiles",
            })
            .exec();
        return res.status(200).json(historyvideo);
    } catch (error) {
        console.error("error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const removehistory = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid history entry" });
    }
    try {
        const removed = await history.findByIdAndDelete(id);
        if (!removed) return res.status(404).json({ message: "History entry not found" });
        return res.status(200).json({ history: true });
    } catch (error) {
        console.error("Error removing history:", error);
        return res.status(500).json({ message: "Unable to remove history entry" });
    }
};