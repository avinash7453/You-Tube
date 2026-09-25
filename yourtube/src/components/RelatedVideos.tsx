import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type VideoItem = {
  id: number | string;
  videotitle: string;
  videochannel: string;
  views: number;
  createdAt: string;
};

const RelatedVideos = ({ videos }: { videos: VideoItem[] }) => {
  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <Link
          key={video.id}
          href={`/watch/${video.id}`}
          className="block rounded-md border border-gray-200 bg-white p-2 shadow-sm transition hover:shadow-md"
        >
          <div className="overflow-hidden rounded-md">
            <video
              src="/Untitled - August 06, 2026 at 15.12.52.mp4"
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