import React, { useEffect, useState } from "react";
import Link from "next/link";

interface LikedItem {
    id: string;
    videoid: string;
    viewer: string;
    likedon: string;
    video: {
        id: string;
        videotitle: string;
        videochannel: string;
        views: number;
        createdAt: string;
    };
}

const LikedContent = () => {
    const [likedVideos, setLikedVideos] = useState<LikedItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLikedVideos = async () => {
            try {
                const json = window.localStorage.getItem("yourtube_liked");
                const storedLiked: LikedItem[] = json ? JSON.parse(json) : [];
                const sortedLiked = storedLiked.sort(
                    (a, b) => new Date(b.likedon).getTime() - new Date(a.likedon).getTime()
                );
                setLikedVideos(sortedLiked);
            } catch (error) {
                console.error("error loading liked videos:", error);
                setLikedVideos([]);
            } finally {
                setLoading(false);
            }
        };

        loadLikedVideos();
    }, []); // <-- Empty dependency array ensures it loads once safely on mount

    return (
        <div className="space-y-4 max-w-6xl mx-auto p-4">
            {loading ? (
                <div>Loading liked videos...</div>
            ) : likedVideos.length === 0 ? (
                <div className="rounded border border-gray-200 bg-gray-50 p-6 text-gray-600">
                    Your liked videos will appear here once you like a video.
                </div>
            ) : (
                <div className="space-y-4">
                    {likedVideos.map((item) => (
                        <Link 
                            key={item.id} 
                            href={`/watch/${item.video.id}`}
                            className="flex flex-col sm:flex-row gap-4 rounded-lg border border-gray-100 bg-white p-3 shadow-sm hover:bg-gray-50 transition"
                        >
                            {/* Video Preview Thumbnail Container */}
                            <div className="relative w-full sm:w-80 aspect-video rounded-md bg-black overflow-hidden flex-shrink-0 flex items-center justify-center">
                                <video
                                    src="/Untitled - August 06, 2026 at 15.12.52.mp4"
                                    className="w-full h-full object-cover"
                                    preload="metadata"
                                    playsInline
                                />
                            </div>

                            {/* Video Details & Like Info */}
                            <div className="flex flex-col justify-between flex-1 py-1">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-2">
                                        {item.video.videotitle}
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">{item.video.videochannel}</p>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {item.video.views?.toLocaleString()} views · Added: {new Date(item.video.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 mt-2 sm:mt-0">
                                    Liked on: {new Date(item.likedon).toLocaleString()}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LikedContent;