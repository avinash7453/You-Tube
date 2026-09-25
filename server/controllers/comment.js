import comment from "../Modals/comment.js";
import mongoose from "mongoose";

const abusiveWords = ["asshole", "bastard", "bitch", "fuck", "idiot", "nazi", "slut", "stupid"];

const moderateComment = (value) => {
    const normalized = value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").trim();
    const words = normalized.split(/\s+/).filter(Boolean);
    const hasAbuse = abusiveWords.some((word) => words.includes(word));
    const hasRepeatedSpecials = /([^\p{L}\p{N}\s])\1{4,}/u.test(value);
    const hasSpamPattern = /(https?:\/\/|www\.|buy now|free money|subscribe to my)/i.test(value);
    return { hasAbuse, hasRepeatedSpecials, hasSpamPattern };
};

export const postcomment = async (req, res) => {
    const { videoid, userid, commentbody, usercommented, language, location, showLocation } = req.body;
    if (
        !mongoose.Types.ObjectId.isValid(videoid) ||
        !mongoose.Types.ObjectId.isValid(userid) ||
        !commentbody?.trim()
    ) {
        return res.status(400).json({
            message: "A valid video ID, user ID, and non-empty comment are required",
        });
    }
    const moderation = moderateComment(commentbody.trim());
    if (moderation.hasAbuse || moderation.hasRepeatedSpecials || moderation.hasSpamPattern) {
        return res.status(422).json({
            message: "This comment was blocked because it contains abusive, spam, or repeated special-character content.",
        });
    }
    const duplicate = await comment.findOne({
        videoid,
        userid,
        commentbody: commentbody.trim(),
        createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
    });
    if (duplicate) {
        return res.status(429).json({ message: "Please avoid posting the same comment repeatedly." });
    }

    const postcomment = new comment({
        videoid,
        userid,
        commentbody: commentbody.trim(),
        usercommented: usercommented || "Anonymous",
        language: language || "auto",
        location: showLocation ? location : undefined,
        showLocation: Boolean(showLocation && location),
    });
    try {
        await postcomment.save();
        return res.status(200).json({ comment: true });
    } catch (error) {
        console.error("error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const reactToComment = async (req, res) => {
    const { id } = req.params;
    const { userid, reaction } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userid) ||
        !["like", "dislike"].includes(reaction)) {
        return res.status(400).json({ message: "A valid comment, user, and reaction are required" });
    }
    try {
        const target = await comment.findById(id);
        if (!target) return res.status(404).json({ message: "Comment unavailable" });
        const liked = target.likes.some((entry) => entry.toString() === userid);
        const disliked = target.dislikes.some((entry) => entry.toString() === userid);
        target.likes = target.likes.filter((entry) => entry.toString() !== userid);
        target.dislikes = target.dislikes.filter((entry) => entry.toString() !== userid);
        const active = reaction === "like" ? liked : disliked;
        if (!active) target[`${reaction}s`].push(userid);
        await target.save();
        return res.status(200).json({
            likes: target.likes.length,
            dislikes: target.dislikes.length,
            reaction: active ? null : reaction,
        });
    } catch (error) {
        console.error("Comment reaction error:", error);
        return res.status(500).json({ message: "Unable to update comment reaction" });
    }
};

export const reportComment = async (req, res) => {
    const { id } = req.params;
    const { userid, reason } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userid)) {
        return res.status(400).json({ message: "A valid comment and user are required" });
    }
    try {
        const target = await comment.findById(id);
        if (!target) return res.status(404).json({ message: "Comment unavailable" });
        if (!target.reports.some((report) => report.userid.toString() === userid)) {
            target.reports.push({ userid, reason: reason || "community report" });
        }
        target.flagged = true;
        await target.save();
        return res.status(200).json({ reported: true, flagged: target.flagged });
    } catch (error) {
        console.error("Comment report error:", error);
        return res.status(500).json({ message: "Unable to report comment" });
    }
};

export const translateComment = async (req, res) => {
    const { text, targetLanguage } = req.body;
    const providerUrl = process.env.TRANSLATION_API_URL;
    if (!text?.trim() || !targetLanguage || !providerUrl) {
        return res.status(503).json({ message: "Translation is not configured yet" });
    }
    try {
        const isMyMemory = providerUrl.includes("api.mymemory.translated.net");
        const requestUrl = isMyMemory
            ? `${providerUrl}?q=${encodeURIComponent(text)}&langpair=autodetect%7C${encodeURIComponent(targetLanguage)}`
            : providerUrl;
        const response = await fetch(requestUrl, {
            method: isMyMemory ? "GET" : "POST",
            headers: { "Content-Type": "application/json" },
            body: isMyMemory
                ? undefined
                : JSON.stringify({
                    q: text,
                    source: "auto",
                    target: targetLanguage,
                    format: "text",
                    ...(process.env.TRANSLATION_API_KEY
                        ? { api_key: process.env.TRANSLATION_API_KEY }
                        : {}),
                }),
        });
        if (!response.ok) return res.status(502).json({ message: "Translation provider unavailable" });
        const data = await response.json();
        const translatedText = data.translatedText || data.translation || data.responseData?.translatedText;
        if (!translatedText) return res.status(502).json({ message: "Translation provider returned no translation" });
        return res.status(200).json({ translatedText });
    } catch (error) {
        console.error("Comment translation error:", error);
        return res.status(502).json({ message: "Unable to translate comment" });
    }
};

export const getallcomment = async (req, res) => {
    const { videoid } = req.params;
    try {
        const commentvideo = await comment.find({ videoid: videoid });
        return res.status(200).json(commentvideo);
    } catch (error) {
        console.error("error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const deletecomment = async (req, res) => {
    const { id: _id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).send("comment unavailable");
    }
    try {
        await comment.findByIdAndDelete(_id);
        return res.status(200).json({ comment: true });
    } catch (error) {
        console.error("error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const editcomment = async (req, res) => {
    const { id: _id } = req.params;
    const { commentbody } = req.body;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).send("comment unavailable");
    }
    try {
        const updatecomment = await comment.findByIdAndUpdate(
            _id,
            { $set: { commentbody: commentbody } }
        );
        res.status(200).json(updatecomment);
    } catch (error) {
        console.error("error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};