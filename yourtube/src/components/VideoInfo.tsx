import React, { useEffect, useState } from 'react';
import { 
    Clock, 
    Download, 
    MoreHorizontal, 
    Share, 
    ThumbsDown, 
    ThumbsUp 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from "@/lib/AuthContext";
import axiosInstance from '@/lib/axiosinstance';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/router';

const Videoinfo = ({ video }: { video: any }) => {
    const { user } = useUser();
    const [likes, setlikes] = useState(Math.max(0, video.likes ?? video.Like ?? 0));
    const [dislikes, setDislikes] = useState(video.Dislike || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [isWatchLater, setIsWatchLater] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const router = useRouter();

    const shareVideo = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: video.videotitle, url });
            } else {
                await navigator.clipboard.writeText(url);
                toast.success("Video link copied.");
            }
        } catch (error: any) {
            if (error?.name !== "AbortError") toast.error("Unable to share this video.");
        }
    };

    const descriptionText = video.description || "Sample video description. This would contain the actual description from the database and is intentionally longer so the show more and show less controls appear for testing.";
    const publishedDate = video.createdAt ? new Date(video.createdAt) : new Date();
    const shouldShowToggle = descriptionText.length > 100;

    useEffect(() => {
        setlikes(Math.max(0, video.likes ?? video.Like ?? 0));
        setDislikes(video.Dislike || 0);
        setIsLiked(false);
        setIsDisliked(false);
        setIsWatchLater(false);
    }, [video]);

    useEffect(() => {
        const handleviews = async () => {
            if (user) {
                try {
                    return await axiosInstance.post(`/history/${video?._id || video?.id}`, {
                        userId: user?._id,
                    });
                } catch (error) {
                    return console.log(error);
                }
            } else {
                return await axiosInstance.post(`/history/views/${video?._id || video?.id}`);
            }
        };
        handleviews();
    }, [user]);

    const handleLike = async () => {
        if (!user) return;
        try {
            const res = await axiosInstance.post(`/like/${video._id || video.id}`, {
                userId: user?._id,
            });
            if (typeof res.data.likes === "number") {
                setlikes(Math.max(0, res.data.likes));
            }
            setIsLiked(res.data.liked);
            if (res.data.liked && isDisliked) {
                setDislikes((prev: any) => Math.max(0, prev - 1));
                setIsDisliked(false);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleWatchLater = async () => {
        if (!user) return;
        try {
            const res = await axiosInstance.post(`/watchlater/${video._id || video.id}`, {
                userId: user?._id,
            });
            if (res.data.watchlater) {
                setIsWatchLater(true);
            } else {
                setIsWatchLater(false);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleDislike = async () => {
        if (!user) return;
        try {
            const res = await axiosInstance.post(`/like/${video._id || video.id}`, {
                userId: user?._id,
            });
            if (res.data.liked) {
                if (isDisliked) {
                    setDislikes((prev: any) => prev - 1);
                    setIsDisliked(false);
                } else {
                    setDislikes((prev: any) => prev + 1);
                    setIsDisliked(true);
                    if (isLiked) {
                        setlikes((prev: any) => prev - 1);
                        setIsLiked(false);
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleDownload = async () => {
        const userId = user?._id || user?.id;
        const videoId = video?._id || video?.id;
        if (!userId) {
            toast.error("Sign in to download videos.");
            return;
        }
        if (!videoId) {
            toast.error("This video cannot be downloaded.");
            return;
        }
        setIsDownloading(true);
        try {
            const response = await axiosInstance.post(`/download/${videoId}`, { userId });
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
            const link = document.createElement("a");
            link.href = `${backendUrl}${response.data.url}`;
            link.download = video.filename || `${video.videotitle}.mp4`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success(`Download started. ${response.data.remaining} downloads remaining today.`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Unable to download this video.");
        } finally {
            setIsDownloading(false);
        }
    };

    const createWatchParty = async () => {
        const userId = user?._id || user?.id;
        const videoId = video?._id || video?.id;
        if (!userId || !videoId) {
            toast.error("Sign in to start a watch party.");
            return;
        }
        try {
            const response = await axiosInstance.post("/watchparty", {
                videoId,
                videoPath: video.filepath,
                hostId: userId,
                name: user.name || "Host",
            });
            await router.push(`/watch-party/${response.data.roomId}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Unable to create watch party.");
        }
    };

    return (
        <div className="rounded-lg bg-white p-4 text-gray-900 shadow-md dark:bg-gray-900 dark:text-gray-100">
            <h1 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">{video.videotitle}</h1>
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-sm font-medium">
                        {video.videochannel?.[0]}
                    </div>
                    <div className="flex flex-col">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{video.videochannel}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">1.2M subscribers</p>
                    </div>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded font-medium">
                    Subscribe
                </button>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full text-gray-800 hover:bg-gray-200 dark:text-gray-100 dark:hover:bg-gray-700 ${isLiked ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white" : ""}`}
                    onClick={handleLike}
                >
                    <ThumbsUp className={`w-5 h-5 mr-2 ${isLiked ? "fill-black text-black" : ""}`} />
                    {likes.toLocaleString()}
                </Button>

                <div className="w-px h-6 bg-gray-300" />

                <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full text-gray-800 hover:bg-gray-200 dark:text-gray-100 dark:hover:bg-gray-700 ${isDisliked ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white" : ""}`}
                    onClick={handleDislike}
                >
                    <ThumbsDown className={`w-5 h-5 mr-2 ${isDisliked ? "fill-black text-black" : ""}`} />
                    {dislikes.toLocaleString()}
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 ${isWatchLater ? "text-blue-700 dark:text-blue-300" : ""}`}
                    onClick={handleWatchLater}
                >
                    <Clock className="w-5 h-5 mr-2" />
                    {isWatchLater ? "Saved" : "Watch Later"}
                </Button>

                <Button variant="ghost" size="sm" className="rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700" onClick={shareVideo}>
                    <Share className="w-5 h-5 mr-2" />
                    Share
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700" onClick={createWatchParty}>
                    Watch party
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                    onClick={handleDownload}
                    disabled={isDownloading}
                >
                    <Download className="w-5 h-5 mr-2" />
                    {isDownloading ? "Preparing..." : "Download"}
                </Button>

                <Button variant="ghost" size="icon" className="rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700">
                    <MoreHorizontal />
                </Button>
            </div>

            <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>{video.views?.toLocaleString("en-US")} views</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(publishedDate)} ago</span>
                </div>
                <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        {showFullDescription ? descriptionText : `${descriptionText.slice(0, 120)}${descriptionText.length > 120 ? "..." : ""}`}
                    </p>
                </div>
                {shouldShowToggle && (
                    <button
                        onClick={() => setShowFullDescription((prev) => !prev)}
                        className="text-sm font-medium text-blue-600"
                    >
                        {showFullDescription ? "Show less" : "Show more"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Videoinfo;