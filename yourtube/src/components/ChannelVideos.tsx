import React from 'react';
import VideoCard from '@/components/videocard';

const ChannelVideos = ({ videos = [] }: { videos?: any[] }) => {
    if (!videos || videos.length === 0) {
        return (
            <div className="mx-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-violet-200 bg-gradient-to-br from-violet-50 to-orange-50 py-16 text-center text-muted-foreground">
                <div className="mb-3 rounded-full bg-white p-4 text-2xl shadow-sm">🎬</div>
                <p className="text-lg font-semibold text-gray-800">No videos uploaded yet</p>
                <p className="mt-1 text-sm">Share your first story with the YourTube community.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 px-4 pb-8 md:px-8">
            <h2 className="text-xl font-bold text-gray-900">Videos</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {videos.map((video: any) => (
                    <VideoCard key={video.id} video={video} />
                ))}
            </div>
        </div>
    );
};

export default ChannelVideos;
