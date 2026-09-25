import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideos";
import VideoInfo from "@/components/VideoInfo";
import Videopplayer from "@/components/videopplayer";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const Index = () => {
  const router = useRouter();
  const { id } = router.query;

  const [videos, setVideos] = useState<any[]>([]);
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchVideoData = async () => {
      try {
        const res = await axiosInstance.get("/video/getall");
        const allVideos = res.data;
        setVideos(allVideos);

        // Find the specific video matching the route ID (_id from MongoDB)
        const currentVideo = allVideos.find((vid: any) => vid._id === id);
        setVideo(currentVideo || allVideos[0]);
      } catch (error) {
        console.error("Error fetching video:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!video) {
    return <div className="min-h-screen flex items-center justify-center">Video not found</div>;
  }

  // Filter out the currently playing video from the related list
  const relatedVideosList = videos.filter((item: any) => item._id !== video._id);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Videopplayer video={video} />
            <VideoInfo video={video} />
            <Comments videoId={id} />
          </div>
          <div className="space-y-4">
            <RelatedVideos videos={relatedVideosList} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;