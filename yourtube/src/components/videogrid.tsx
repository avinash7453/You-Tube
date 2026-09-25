import React, { useEffect, useState } from "react";
import VideoCard from "./videocard";
import axiosInstance from "@/lib/axiosinstance";

const VideoGrid = () => {
  const [videos, setVideos] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axiosInstance.get("/video/getall");
        setVideos((await res).data);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  /* const videos = [
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
      description: "This documentary explores the beauty of nature, from quiet forests to breathtaking mountain views. It is a relaxing and inspiring look at the world around us.",
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
      description: "In this cooking tutorial, you will learn how to make pasta from scratch with simple ingredients and easy step-by-step instructions.",
      createdAt: "2023-12-31T00:00:00.000Z",
    },
  ]; */

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {loading ? (<>Loading...</>) : videos.map((video: any) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
};

export default VideoGrid;