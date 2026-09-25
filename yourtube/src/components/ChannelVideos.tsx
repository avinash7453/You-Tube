import React from 'react';
import VideoCard from '@/components/videocard';

const ChannelVideos = ({ videos = [] }: { videos?: any[] }) => {
    if (!videos || videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p className="text-lg">No Videos Uploaded yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video: any) => (
                    <VideoCard key={video.id} video={video} />
                ))}
            </div>
        </div>
    );
};

export default ChannelVideos;
