import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Flag, Languages, ThumbsDown, ThumbsUp } from "lucide-react";

type CommentItem = {
    _id: string;
    videoid: string;
    userid: string;
    commentbody: string;
    usercommented: string;
    commentedon: string;
    language?: string;
    location?: string;
    showLocation?: boolean;
    likes?: string[];
    dislikes?: string[];
    flagged?: boolean;
};

const Comments = ({ videoId }: { videoId?: string | string[] }) => {
    const normalizedVideoId = Array.isArray(videoId) ? videoId[0] ?? "" : videoId ?? "";
    const isMongoId = (value: unknown): value is string =>
        typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitError, setSubmitError] = useState("");
    const [commentLanguage, setCommentLanguage] = useState("auto");
    const [location, setLocation] = useState("");
    const [showLocation, setShowLocation] = useState(false);
    const [targetLanguage, setTargetLanguage] = useState("es");
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [translationLoading, setTranslationLoading] = useState<string | null>(null);
    const [actionError, setActionError] = useState("");

    const { user } = useUser();

    useEffect(() => {
        if (!normalizedVideoId) return;
        loadComments();
    }, [normalizedVideoId]);

    const loadComments = async () => {
        try {
            const res = await axiosInstance.get(`/comment/${normalizedVideoId}`);
            setComments(res.data);
        } catch (error) {
            console.error("Error loading comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async () => {
        const userId = isMongoId(user?._id) ? user._id : isMongoId(user?.id) ? user.id : "";
        if (!userId || !isMongoId(normalizedVideoId) || !newComment.trim()) {
            setSubmitError("Please refresh the page and sign in again before commenting.");
            return;
        }

        setIsSubmitting(true);
        setSubmitError("");

        try {
            const res = await axiosInstance.post("/comment/postcomment", {
                videoid: normalizedVideoId,
                userid: userId,
                commentbody: newComment.trim(),
                usercommented: user.name || "Anonymous",
                language: commentLanguage,
                location: showLocation ? location.trim() : undefined,
                showLocation: showLocation && Boolean(location.trim()),
            });

            if (res.data.comment) {
                const newCommentObj: CommentItem = {
                    _id: Date.now().toString(),
                    videoid: normalizedVideoId,
                    userid: userId,
                    commentbody: newComment.trim(),
                    usercommented: user.name || "Anonymous",
                    commentedon: new Date().toISOString(),
                    language: commentLanguage,
                    location: showLocation ? location.trim() : undefined,
                    showLocation: showLocation && Boolean(location.trim()),
                };

                setComments([newCommentObj, ...comments]);
                setNewComment("");
            }
        } catch (error: any) {
            setSubmitError(error.response?.data?.message || "Unable to post comment. Please try again.");
            console.error("Error adding comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (comment: CommentItem) => {
        setEditingCommentId(comment._id);
        setEditText(comment.commentbody);
    };

    const handleUpdateComment = async () => {
        if (!editText.trim()) return;

        try {
            const res = await axiosInstance.post(`/comment/editcomment/${editingCommentId}`, {
                commentbody: editText,
            });

            if (res.data) {
                setComments((prev) =>
                    prev.map((c) =>
                        c._id === editingCommentId ? { ...c, commentbody: editText } : c
                    )
                );
            }
        } catch (error) {
            console.log(error);
        }

        setEditingCommentId(null);
        setEditText("");
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await axiosInstance.delete(`/comment/deletecomment/${id}`);
            if (res.data.comment) {
                setComments((prev) => prev.filter((c) => c._id !== id));
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleReaction = async (commentId: string, reaction: "like" | "dislike") => {
        const userId = user?._id || user?.id;
        if (!userId) return;
        try {
            const response = await axiosInstance.post(`/comment/${commentId}/reaction`, {
                userid: userId,
                reaction,
            });
            setComments((prev) => prev.map((item) => item._id === commentId ? {
                ...item,
                likes: Array(response.data.likes).fill("like"),
                dislikes: Array(response.data.dislikes).fill("dislike"),
            } : item));
        } catch (error: any) {
            setActionError(error.response?.data?.message || "Unable to update comment reaction.");
        }
    };

    const handleReport = async (commentId: string) => {
        const userId = user?._id || user?.id;
        if (!userId) return;
        try {
            await axiosInstance.post(`/comment/${commentId}/report`, {
                userid: userId,
                reason: "community report",
            });
            setActionError("Thanks. This comment has been flagged for review.");
        } catch (error: any) {
            setActionError(error.response?.data?.message || "Unable to report comment.");
        }
    };

    const handleTranslate = async (comment: CommentItem) => {
        if (translations[comment._id]) {
            setTranslations((prev) => {
                const next = { ...prev };
                delete next[comment._id];
                return next;
            });
            return;
        }
        setTranslationLoading(comment._id);
        setActionError("");
        try {
            const response = await axiosInstance.post("/comment/translate", {
                text: comment.commentbody,
                targetLanguage,
            });
            setTranslations((prev) => ({ ...prev, [comment._id]: response.data.translatedText }));
        } catch (error: any) {
            setActionError(error.response?.data?.message || "Translation is currently unavailable.");
        } finally {
            setTranslationLoading(null);
        }
    };

    if (loading) {
        return <div>Loading comments...</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">{comments.length} Comments</h2>

            {submitError && (
                <p className="text-sm text-red-600" role="alert">{submitError}</p>
            )}
            {actionError && (
                <p className="text-sm text-blue-700" role="status">{actionError}</p>
            )}

            {user && (
                <div className="flex gap-4">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                        <Textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <label className="flex items-center gap-2">
                                Comment language
                                <select
                                    value={commentLanguage}
                                    onChange={(event) => setCommentLanguage(event.target.value)}
                                    className="rounded border border-gray-300 bg-white px-2 py-1"
                                >
                                    <option value="auto">Auto-detect</option>
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="hi">Hindi</option>
                                    <option value="de">German</option>
                                </select>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={showLocation}
                                    onChange={(event) => setShowLocation(event.target.checked)}
                                />
                                Share my location
                            </label>
                            {showLocation && (
                                <input
                                    value={location}
                                    onChange={(event) => setLocation(event.target.value)}
                                    placeholder="Optional location"
                                    className="rounded border border-gray-300 px-2 py-1"
                                />
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setNewComment("")}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmitComment}
                                disabled={isSubmitting || !newComment.trim()}
                            >
                                {isSubmitting ? "Posting..." : "Comment"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                        No comments yet. Be the first to comment!
                    </p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment._id} className="flex gap-4">
                            <Avatar className="w-10 h-10">
                                <AvatarImage src="/placeholder.svg" height={40} width={40} />
                                <AvatarFallback>{comment.usercommented[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">
                                        {comment.usercommented}
                                    </span>
                                    <span className="text-xs text-gray-600">
                                        {formatDistanceToNow(new Date(comment.commentedon))} ago
                                    </span>
                                </div>

                                {editingCommentId === comment._id ? (
                                    <div className="space-y-2">
                                        <Textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                onClick={handleUpdateComment}
                                                disabled={!editText.trim()}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setEditingCommentId(null);
                                                    setEditText("");
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-800 mt-1">
                                            {translations[comment._id] || comment.commentbody}
                                        </p>
                                        {comment.showLocation && comment.location && (
                                            <p className="text-xs text-gray-500 mt-1">Location shared: {comment.location}</p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
                                            {user && (
                                                <>
                                                    <button onClick={() => handleReaction(comment._id, "like")} className="inline-flex items-center gap-1 hover:text-blue-600">
                                                        <ThumbsUp className="h-3.5 w-3.5" /> {comment.likes?.length || 0}
                                                    </button>
                                                    <button onClick={() => handleReaction(comment._id, "dislike")} className="inline-flex items-center gap-1 hover:text-blue-600">
                                                        <ThumbsDown className="h-3.5 w-3.5" /> {comment.dislikes?.length || 0}
                                                    </button>
                                                    <button onClick={() => handleReport(comment._id)} className="inline-flex items-center gap-1 hover:text-red-600">
                                                        <Flag className="h-3.5 w-3.5" /> Report
                                                    </button>
                                                </>
                                            )}
                                            <select
                                                value={targetLanguage}
                                                onChange={(event) => setTargetLanguage(event.target.value)}
                                                className="rounded border border-gray-300 bg-white px-1.5 py-1"
                                                aria-label="Translation language"
                                            >
                                                <option value="es">Spanish</option>
                                                <option value="fr">French</option>
                                                <option value="de">German</option>
                                                <option value="hi">Hindi</option>
                                                <option value="ja">Japanese</option>
                                            </select>
                                            <button onClick={() => handleTranslate(comment)} className="inline-flex items-center gap-1 hover:text-blue-600" disabled={translationLoading === comment._id}>
                                                <Languages className="h-3.5 w-3.5" /> {translationLoading === comment._id ? "Translating..." : translations[comment._id] ? "Original" : "Translate"}
                                            </button>
                                            {user?._id === comment.userid && (
                                                <span className="inline-flex items-center gap-3">
                                                <button
                                                    onClick={() => handleEdit(comment)}
                                                    className="hover:text-blue-600 font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(comment._id)}
                                                    className="hover:text-red-600 font-medium"
                                                >
                                                    Delete
                                                </button>
                                                </span>
                                            )}
                                            </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Comments;