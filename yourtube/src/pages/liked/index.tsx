import { Suspense, useState, useEffect } from "react";
import LikedContent from "@/components/LikedContent";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash } from "lucide-react";

const LikedIndex = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePlayAll = () => {
    if (typeof window === "undefined") return;
    const json = window.localStorage.getItem("yourtube_liked");
    const arr = json ? JSON.parse(json) : [];
    if (arr && arr.length > 0) {
      const firstId = arr[0].video?.id ?? arr[0].videoid ?? "";
      if (firstId) router.push(`/watch/${firstId}`);
    } else {
      alert("No liked videos to play.");
    }
  };

  const handleClearLiked = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("yourtube_liked");
    router.replace(router.asPath);
  };

  // Prevent server/client hydration mismatch by deferring render until client mount
  if (!isMounted) {
    return <div className="p-4 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Liked Videos</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handlePlayAll}>
            Play All
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={handleClearLiked}>
                <Trash className="mr-2 h-4 w-4" /> Clear Liked
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Suspense fallback={<div>Loading liked videos...</div>}>
        <LikedContent />
      </Suspense>
    </div>
  );
};

export default LikedIndex;