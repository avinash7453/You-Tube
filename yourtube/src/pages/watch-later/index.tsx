import { Suspense } from "react";
import WatchLaterContent from "@/components/WatchLaterContent";

const WatchLaterIndex = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Watch Later</h1>
      <Suspense fallback={<div>Loading watch later...</div>}>
        <WatchLaterContent />
      </Suspense>
    </div>
  );
};

export default WatchLaterIndex;
