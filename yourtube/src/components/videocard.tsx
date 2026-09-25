import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Download, Share, ThumbsDown, ThumbsUp } from "lucide-react";
import { formatVideoDate } from "@/lib/utils";

const VideoCard = ({ video }: any) => {
  const videoId = video?._id || video?.id;
  const videos = "/Untitled - August 06, 2026 at 15.12.52.mp4";
  const videoPath = String(video?.filepath || videos).replace(/\\/g, "/").replace(/^\/+/, "/");
  const [likes, setLikes] = useState(Math.max(0, video?.likes || 0));
  const [dislikes, setDislikes] = useState(Math.max(0, video?.dislikes || 0));
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  const shareVideo = async (event: React.MouseEvent) => {
    event.preventDefault();
    const url = `${window.location.origin}/watch/${videoId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.error("Unable to copy video link:", error);
    }
  };

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const json = window.localStorage.getItem("yourtube_liked");
        const arr = json ? JSON.parse(json) : [];
        const liked = arr.some((it: any) => it.videoid === `${videoId}`);
        setIsLiked(Boolean(liked));
      }
    } catch (e) {
      console.error("error reading liked storage:", e);
    }
  }, [video]);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents link redirection when clicking buttons
    if (isLiked) {
      setLikes((prev: number) => Math.max(0, prev - 1));
      setIsLiked(false);
      try {
        const json = window.localStorage.getItem("yourtube_liked");
        const arr = json ? JSON.parse(json) : [];
        const filtered = arr.filter((item: any) => item.videoid !== `${videoId}`);
        window.localStorage.setItem("yourtube_liked", JSON.stringify(filtered));
      } catch (e) {
        console.error("error updating liked storage:", e);
      }
    } else {
      setLikes((prev: number) => prev + 1);
      setIsLiked(true);
      if (isDisliked) {
        setDislikes((prev: number) => Math.max(0, prev - 1));
        setIsDisliked(false);
      }
      try {
        const json = window.localStorage.getItem("yourtube_liked");
        const arr = json ? JSON.parse(json) : [];
        const entry = {
          id: `${videoId}-${new Date().getTime()}`,
          videoid: `${videoId}`,
          viewer: "1",
          likedon: new Date().toISOString(),
          video: {
            id: `${videoId}`,
            videotitle: video.videotitle,
            videochannel: video.videochannel,
            views: video.views,
            createdAt: video.createdAt,
          },
        };
        const without = arr.filter((it: any) => it.videoid !== `${videoId}`);
        window.localStorage.setItem("yourtube_liked", JSON.stringify([entry, ...without].slice(0,50)));
      } catch (e) {
        console.error("error updating liked storage:", e);
      }
    }
  };

  const handleDislike = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDisliked) {
      setDislikes((prev: number) => Math.max(0, prev - 1));
      setIsDisliked(false);
    } else {
      setDislikes((prev: number) => prev + 1);
      setIsDisliked(true);
    }
  };

  return (
    <Link href={videoId ? `/watch/${videoId}` : "#"} className="group block min-w-0">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-200">
        <video
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}${videoPath}`}
          className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
          preload="metadata"
          playsInline
          muted
        />
      </div>

      <div className="mt-2 flex gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
          {(video?.videochannel || "V").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900">{video?.title || video?.videotitle}</div>
          <div className="mt-1 text-xs text-gray-600">{video?.videochannel || "YourTube"}</div>
          <div className="text-xs text-gray-500">
            {Math.max(0, video?.views || 0).toLocaleString("en-US")} views · {formatVideoDate(video?.createdAt)}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;