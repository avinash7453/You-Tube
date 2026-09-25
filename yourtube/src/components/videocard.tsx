import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Download, Share, ThumbsDown, ThumbsUp } from "lucide-react";
import { formatVideoDate } from "@/lib/utils";

const VideoCard = ({ video }: any) => {
  const videos = "/Untitled - August 06, 2026 at 15.12.52.mp4";
  const [likes, setLikes] = useState(video?.likes || 0);
  const [dislikes, setDislikes] = useState(video?.dislikes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const json = window.localStorage.getItem("yourtube_liked");
        const arr = json ? JSON.parse(json) : [];
        const liked = arr.some((it: any) => it.videoid === `${video.id}`);
        setIsLiked(Boolean(liked));
      }
    } catch (e) {
      console.error("error reading liked storage:", e);
    }
  }, [video]);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents link redirection when clicking buttons
    if (isLiked) {
      setLikes((prev: number) => prev - 1);
      setIsLiked(false);
      try {
        const json = window.localStorage.getItem("yourtube_liked");
        const arr = json ? JSON.parse(json) : [];
        const filtered = arr.filter((item: any) => item.videoid !== `${video.id}`);
        window.localStorage.setItem("yourtube_liked", JSON.stringify(filtered));
      } catch (e) {
        console.error("error updating liked storage:", e);
      }
    } else {
      setLikes((prev: number) => prev + 1);
      setIsLiked(true);
      if (isDisliked) {
        setDislikes((prev: number) => prev - 1);
        setIsDisliked(false);
      }
      try {
        const json = window.localStorage.getItem("yourtube_liked");
        const arr = json ? JSON.parse(json) : [];
        const entry = {
          id: `${video.id}-${new Date().getTime()}`,
          videoid: `${video.id}`,
          viewer: "1",
          likedon: new Date().toISOString(),
          video: {
            id: `${video.id}`,
            videotitle: video.videotitle,
            videochannel: video.videochannel,
            views: video.views,
            createdAt: video.createdAt,
          },
        };
        const without = arr.filter((it: any) => it.videoid !== `${video.id}`);
        window.localStorage.setItem("yourtube_liked", JSON.stringify([entry, ...without].slice(0,50)));
      } catch (e) {
        console.error("error updating liked storage:", e);
      }
    }
  };

  const handleDislike = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDisliked) {
      setDislikes((prev: number) => prev - 1);
      setIsDisliked(false);
    } else {
      setDislikes((prev: number) => prev + 1);
      setIsDisliked(true);
    }
  };

  return (
    <Link href={`/watch/${video?.id ?? 1}`} className="block rounded-lg border border-gray-200 bg-white p-3 transition hover:shadow-md">
      {/* 16:9 Aspect Ratio Container to fix big/tall video sizing */}
      <div className="relative w-full aspect-video rounded-md overflow-hidden bg-black">
        <video
          src={`${process.env.BACKEND_URL}${video?.filepath ?? videos}`}
          controls
          className="w-full h-full object-cover"
          preload="auto"
          playsInline
        />
      </div>

      <div className="mt-3">
        <div className="font-semibold text-gray-900 line-clamp-2">{video?.title || video?.videotitle}</div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <div>
            <div className="text-sm font-medium text-gray-700">{video?.videochannel}</div>
            <div className="text-xs text-gray-500">1.2M subscribers</div>
          </div>
          <button 
            onClick={(e) => { e.preventDefault(); }}
            className="rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
          >
            Subscribe
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {video?.views} views · {formatVideoDate(video?.createdAt)}
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2" onClick={(e) => e.preventDefault()}>
          <button onClick={handleLike} className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${isLiked ? 'bg-gray-100 font-bold' : ''}`}>
            <ThumbsUp size={14} /> {likes.toLocaleString("en-US")}
          </button>
          <button onClick={handleDislike} className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${isDisliked ? 'bg-gray-100 font-bold' : ''}`}>
            <ThumbsDown size={14} /> {dislikes.toLocaleString("en-US")}
          </button>
          <button className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs">
            <Share size={14} /> Share
          </button>
          <button className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs">
            <Download size={14} /> Download
          </button>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;