import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

type CommentItem = {
    _id: string;
    videoid: string;
    userid: string;
    commentbody: string;
    usercommented: string;
    commentedon: string;
};

const Comments = ({ videoId }: { videoId?: string | string[] }) => {
    const normalizedVideoId = Array.isArray(videoId) ? videoId[0] ?? "" : videoId ?? "";
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [loading, setLoading] = useState(true);

    const { user } = useUser();

    useEffect(() => {
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
        if (!user || !newComment.trim()) return;

        setIsSubmitting(true);

        try {
            const res = await axiosInstance.post("/comment/postcomment", {
                videoid: normalizedVideoId,
                userid: user._id,
                commentbody: newComment,
                usercommented: user.name,
            });

            if (res.data.comment) {
                const newCommentObj: CommentItem = {
                    _id: Date.now().toString(),
                    videoid: normalizedVideoId,
                    userid: user._id,
                    commentbody: newComment,
                    usercommented: user.name || "Anonymous",
                    commentedon: new Date().toISOString(),
                };

                setComments([newCommentObj, ...comments]);
                setNewComment("");
            }
        } catch (error) {
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

    if (loading) {
        return <div>Loading comments...</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">{comments.length} Comments</h2>

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
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setNewComment("")}
                                className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmitComment}
                                disabled={isSubmitting || !newComment.trim()}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSubmitting ? "Posting..." : "Comment"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3">
                        <Avatar className="w-8 h-8">
                            <AvatarFallback>{comment.usercommented?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{comment.usercommented}</span>
                                <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(comment.commentedon))} ago
                                </span>
                            </div>

                            {editingCommentId === comment._id ? (
                                <div className="mt-2 space-y-2">
                                    <Textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleUpdateComment}
                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingCommentId(null);
                                                setEditText("");
                                            }}
                                            className="px-3 py-1 border text-sm rounded"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-800 mt-1">{comment.commentbody}</p>
                                    {user?._id === comment.userid && (
                                        <div className="flex gap-3 text-xs text-gray-500 mt-2">
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
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Comments;