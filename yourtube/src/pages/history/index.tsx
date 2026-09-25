import { Suspense } from "react";
import HistoryContent from "@/components/HistoryContent";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Play, Trash } from "lucide-react";

const HistoryIndex = () => {
  const router = useRouter();

  const handlePlayAll = () => {
    if (typeof window === "undefined") return;
    const json = window.localStorage.getItem("yourtube_history");
    const arr = json ? JSON.parse(json) : [];
    if (arr && arr.length > 0) {
      const firstId = arr[0].video?.id ?? arr[0].videoid ?? "";
      if (firstId) router.push(`/watch/${firstId}`);
    } else {
      alert("No history videos to play.");
    }
  };

  const handleClearHistory = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("yourtube_history");
    router.replace(router.asPath);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Watch History</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={handlePlayAll}>
              <Play className="mr-2" /> Play All
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleClearHistory}>
              <Trash className="mr-2" /> Clear History
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Suspense fallback={<div>Loading history...</div>}>
        <HistoryContent />
      </Suspense>
    </div>
  );
};

export default HistoryIndex;
