import VideoGrid from "@/components/videogrid";

const ExplorePage = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Explore</h1>
        <p className="text-sm text-gray-600">Discover videos from yourtube.</p>
      </div>
      <VideoGrid />
    </div>
  );
};

export default ExplorePage;
