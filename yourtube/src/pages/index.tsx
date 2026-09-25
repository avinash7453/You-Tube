import CategoryTabs from "@/components/category-tabs";
import VideoGrid from "@/components/videogrid";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="p-3 md:p-4">
      <CategoryTabs />
      <Suspense fallback={<div>loading videos ...</div>}>
        <VideoGrid />
      </Suspense>
    </main>
  );
}
