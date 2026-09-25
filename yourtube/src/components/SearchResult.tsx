import React, { useEffect, useState } from 'react';
import VideoCard from '@/components/videocard';

const SearchResult = ({ query }: any) => {
    const [video, setvideos] = useState<any[] | null>(null);

    useEffect(() => {
        if (!query || !query.trim()) {
            setvideos([]);
            return;
        }

        const allvideos = [
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

        let results = allvideos.filter(
            (vid) =>
                vid.videotitle.toLowerCase().includes(query.toLowerCase()) ||
                vid.videochannel.toLowerCase().includes(query.toLowerCase())
        );
        setvideos(results);
    }, [query]);

    if (!query || !query.trim()) {
        return (
            <div className='text-center py-12'>
                <p className='text-gray-600'>Enter a search term to find videos</p>
            </div>
        );
    }

    if (!video || video.length === 0) {
        return (
            <div className='text-center py-12'>
                <h2 className='text-xl font-semibold mb-2'>No results found</h2>
                <p className='text-gray-600'>Try a different keyword or remove search filter</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {video.map((vid) => (
                <VideoCard key={vid.id} video={vid} />
            ))}
        </div>
    );
};

export default SearchResult;