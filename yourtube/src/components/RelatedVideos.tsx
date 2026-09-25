import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type VideoItem = {
  _id?: string;
  id?: number | string;
  videotitle: string;
  videochannel: string;
  views: number;
  createdAt: string;
  filepath?: string;
};

const RelatedVideos = ({ videos }: { videos: VideoItem[] }) => {
  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <Link
          key={video._id || video.id}
          href={`/watch/${video._id || video.id}`}
          className="block rounded-md border border-gray-200 bg-white p-2 shadow-sm transition hover:shadow-md"
        >
          <div className="overflow-hidden rounded-md">
            <video
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}${String(video.filepath || "/Untitled - August 06, 2026 at 15.12.52.mp4").replace(/\\/g, "/").replace(/^\/+/, "/")}`}
              className="h-28 w-full rounded-md object-cover"
              muted
              playsInline
            />
          </div>
          <div className="mt-2">
            <h3 className="text-sm font-semibold text-gray-900">{video.videotitle}</h3>
            <p className="text-xs text-gray-600">{video.videochannel}</p>
            <p className="text-xs text-gray-500">
              {video.views.toLocaleString("en-US")} views • {formatDistanceToNow(new Date(video.createdAt))} ago
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RelatedVideos;