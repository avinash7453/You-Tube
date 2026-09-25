import React from 'react';
import { useRouter } from 'next/router';
import ChannelHeader from '@/components/ChannelHeader';
import ChannelTabs from '@/components/ChannelTabs';
import VideoUploader from '@/components/VideoUploader';
import ChannelVideos from '@/components/ChannelVideos';
import { notFound } from 'next/dist/client/components/navigation';

const ChannelIndex = () => {
    const router = useRouter();
    const { id } = router.query as { id: string };

    const user: any = {
        id: "1",
        name: "avinash",
        email: "misalavinash82@gmail.com",
        image: "https://avatars.githubusercontent.com/u/12345678?v=4"
    };

    try {
        const channel = {
            ...user,
            id: user?.id || id,
            channelname: user?.channelname || user?.name || "avinash",
            description: "Welcome to my channel."
        };

        if (!channel) {
            notFound();
        }

        const videos = [
            {
                id: 1,
                videotitle: "Amazing Nature Documentary",
                filename: "nature-doc.mp4",
                filetype: "video/mp4",
                filepath: "/videos/nature-doc.mp4",
                filesize: "500MB",
                videochannel: "Nature Channel",
                likes: 1250,
                views: 45000,
                uploader: "Nature-Lover",
                description: "This documentary explores the beauty of nature, from quiet forests to breathtaking mountain views.",
                createdAt: "2024-01-01T00:00:00.000Z",
            },
            {
                id: 2,
                videotitle: "Cooking tutorial: making pasta",
                filename: "cooking-tutorial.mp4",
                filetype: "video/mp4",
                filepath: "/videos/cooking-tutorial.mp4",
                filesize: "300MB",
                videochannel: "Cooking Channel",
                likes: 890,
                views: 23000,
                uploader: "chef_master",
                description: "In this cooking tutorial, you will learn how to make pasta from scratch with simple ingredients.",
                createdAt: "2023-12-31T00:00:00.000Z",
            },
        ];

        return (
            <div className='min-h-screen bg-gradient-to-b from-violet-50/60 via-white to-white'>
                <div className='mx-auto max-w-7xl'>
                    <ChannelHeader channel={channel} user={user} />
                    <ChannelTabs />
                    <div className='px-4 pb-8 pt-6 md:px-8'>
                        <VideoUploader channelId={id} channelName={channel.channelname} />
                    </div>
                    <div>
                        <ChannelVideos videos={videos} />
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error fetching channel data:", error);
        return <div>Error loading channel page.</div>;
    }
};

export default ChannelIndex;