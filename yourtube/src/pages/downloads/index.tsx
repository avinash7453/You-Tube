import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

type DownloadItem = {
  _id: string;
  videoid: string;
  videotitle: string;
  filename: string;
  userPlan: string;
  downloadedon: string;
};

const DownloadsPage = () => {
  const { user, loading } = useUser();
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    axiosInstance.get(`/download/${userId}`)
      .then((response) => setDownloads(response.data))
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load downloads."));
  }, [user]);

  if (loading) return <div>Loading downloads...</div>;
  if (!user) return <div className="rounded-lg border bg-white p-6">Sign in to view your downloads.</div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Downloads</h1>
        <p className="text-sm text-gray-600">Your download history and plan usage.</p>
      </div>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      {downloads.length === 0 ? (
        <p className="rounded-lg border bg-white p-6 text-sm text-gray-600">No videos downloaded yet.</p>
      ) : (
        <div className="space-y-3">
          {downloads.map((item) => (
            <Link key={item._id} href={`/watch/${item.videoid}`} className="block rounded-lg border bg-white p-4 hover:shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-medium text-gray-900">{item.videotitle}</h2>
                <span className="text-xs uppercase text-gray-500">{item.userPlan}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{item.filename}</p>
              <p className="mt-1 text-xs text-gray-500">
                Downloaded {formatDistanceToNow(new Date(item.downloadedon))} ago
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DownloadsPage;
