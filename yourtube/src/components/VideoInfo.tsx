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

const Videoinfo = ({ video }: { video: any }) => {
    const { user } = useUser();
    const [likes, setlikes] = useState(video.Like || 0);
    const [dislikes, setDislikes] = useState(video.Dislike || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [isWatchLater, setIsWatchLater] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);

    const descriptionText = video.description || "Sample video description. This would contain the actual description from the database and is intentionally longer so the show more and show less controls appear for testing.";
    const publishedDate = video.createdAt ? new Date(video.createdAt) : new Date();
    const shouldShowToggle = descriptionText.length > 100;

    useEffect(() => {
        setlikes(video.Like || 0);
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
                return await axiosInstance.get(`/history/views/${video?._id || video?.id}`);
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
            if (res.data.liked) {
                if (isLiked) {
                    setlikes((prev: any) => prev - 1);
                    setIsLiked(false);
                } else {
                    setlikes((prev: any) => prev + 1);
                    setIsLiked(true);
                    if (isDisliked) {
                        setDislikes((prev: any) => prev - 1);
                        setIsDisliked(false);
                    }
                }
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

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h1 className="text-xl font-bold mb-2">{video.videotitle}</h1>
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-sm font-medium">
                        {video.videochannel?.[0]}
                    </div>
                    <div className="flex flex-col">
                        <h3 className="font-medium">{video.videochannel}</h3>
                        <p className="text-sm text-gray-500">1.2M subscribers</p>
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
                    className={`rounded-full ${isLiked ? "bg-gray-100 text-black" : ""}`}
                    onClick={handleLike}
                >
                    <ThumbsUp className={`w-5 h-5 mr-2 ${isLiked ? "fill-black text-black" : ""}`} />
                    {likes.toLocaleString()}
                </Button>

                <div className="w-px h-6 bg-gray-300" />

                <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-full ${isDisliked ? "bg-gray-100 text-black" : ""}`}
                    onClick={handleDislike}
                >
                    <ThumbsDown className={`w-5 h-5 mr-2 ${isDisliked ? "fill-black text-black" : ""}`} />
                    {dislikes.toLocaleString()}
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className={`bg-gray-100 rounded-full ${isWatchLater ? "text-primary" : ""}`}
                    onClick={handleWatchLater}
                >
                    <Clock className="w-5 h-5 mr-2" />
                    {isWatchLater ? "Saved" : "Watch Later"}
                </Button>

                <Button variant="ghost" size="sm" className="bg-gray-100 rounded-full">
                    <Share className="w-5 h-5 mr-2" />
                    Share
                </Button>

                <Button variant="ghost" size="sm" className="bg-gray-100 rounded-full">
                    <Download className="w-5 h-5 mr-2" />
                    Download
                </Button>

                <Button variant="ghost" size="icon" className="bg-gray-100 rounded-full">
                    <MoreHorizontal />
                </Button>
            </div>

            <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <span>{video.views?.toLocaleString("en-US")} views</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(publishedDate)} ago</span>
                </div>
                <div>
                    <p className="text-sm text-gray-600">
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