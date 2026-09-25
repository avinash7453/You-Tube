import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, MoreVertical, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function WatchLaterContent() {
    const [watchLater, setWatchLater] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        if (user) {
            loadWatchLater();
        } else {
            setLoading(true);
        }
    }, [user]);

    const loadWatchLater = async () => {
        if (!user) return;
        try {
            const watchLaterData = await axiosInstance.get(`/watchlater/${user?._id}`);
            setWatchLater(watchLaterData.data);
        } catch (error) {
            console.error("Error loading history:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWatchLater = async (watchLaterId: string, videoId?: string) => {
        try {
            if (!videoId) {
                throw new Error("The saved video ID is missing.");
            }
            await axiosInstance.post(`/watchlater/${videoId}`, {
                userId: user?._id,
            });
            setWatchLater(watchLater.filter((item) => item._id !== watchLaterId));
        } catch (error) {
            console.error("Error removing from watch later:", error);
        }
    };

    if (!user) {
        return (
            <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                    Keep track of what you watch
                </h2>
                <p className="text-gray-600">
                    Watch later list isn't viewable when signed out.
                </p>
            </div>
        );
    }

    if (loading) {
        return <div>Loading watch later...</div>;
    }

    if (watchLater.length === 0) {
        return (
            <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No watch later videos yet</h2>
                <p className="text-gray-600">Videos you save will appear here.</p>
            </div>
        );
    }

    const videos = "/video/vdo.mp4";

    return (
        <div className="space-y-4 max-w-6xl mx-auto p-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">{watchLater.length} videos</p>
            </div>

            <div className="space-y-4">
                {watchLater.map((item) => (
                    <div key={item._id} className="flex gap-4 group items-start">
                        <Link href={`/watch/${item.videoid?._id}`} className="flex-shrink-0">
                            <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden">
                                <video
                                    src={videos}
                                    className="object-cover group-hover:scale-105 transition-transform duration-250 w-full h-full"
                                    preload="metadata"
                                    playsInline
                                />
                            </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                            <Link href={`/watch/${item.videoid?._id}`}>
                                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 mb-1">
                                    {item.videoid?.videotitle}
                                </h3>
                            </Link>
                            <p className="text-sm text-gray-600">{item.videoid?.videochannel}</p>
                            <p className="text-sm text-gray-600">
                                {item.videoid?.views?.toLocaleString()} views • {item.videoid?.createdAt ? formatDistanceToNow(new Date(item.videoid.createdAt)) : ""} ago
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Added {item.createdAt ? formatDistanceToNow(new Date(item.createdAt)) : ""} ago
                            </p>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100"
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => handleRemoveFromWatchLater(item._id, item.videoid?._id)}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Remove from watch later
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ))}
            </div>
        </div>
    );
}