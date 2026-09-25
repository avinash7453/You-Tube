import React, { useState } from 'react'
import Link from "next/link";
import { Clock3, Compass, History as HistoryIcon, Home, ThumbsUp, User } from "lucide-react";
import Channeldialogue from "@/components/Channeldialogue";
import { useUser } from '@/lib/AuthContext';

const Sidebar = () => {
  const { User } = useUser();
  const [isdialogopen, setisdialogopen] = useState(false)

  return (
    <aside className="hidden w-24 shrink-0 border-r bg-white px-2 py-3 sm:block md:w-36">
      <nav className="space-y-1">
        <Link
          href="/"
          className="flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[10px] text-gray-700 hover:bg-gray-100 md:flex-row md:gap-2 md:px-3 md:text-xs"
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>

        <Link
          href="/explore"
          className="flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[10px] text-gray-700 hover:bg-gray-100 md:flex-row md:gap-2 md:px-3 md:text-xs"
        >
          <Compass className="h-4 w-4" />
          <span>Explore</span>
        </Link>

        <Link
          href="/subscriptions"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
        >
          <Compass className="h-4 w-4" />
          <span>Subscriptions</span>
        </Link>

        {User && (
          <div className="mt-3 border-t pt-3">
            <Link
              href="/history"
              className="flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[10px] text-gray-700 hover:bg-gray-100 md:flex-row md:gap-2 md:px-3 md:text-xs"
            >
              <HistoryIcon className="h-4 w-4" />
              <span>History</span>
            </Link>

            <Link
              href="/liked"
              className="flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[10px] text-gray-700 hover:bg-gray-100 md:flex-row md:gap-2 md:px-3 md:text-xs"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>Liked Videos</span>
            </Link>

            <Link
              href="/watch-later"
              className="flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[10px] text-gray-700 hover:bg-gray-100 md:flex-row md:gap-2 md:px-3 md:text-xs"
            >
              <Clock3 className="h-4 w-4" />
              <span>Watch Later</span>
            </Link>
            <Link
              href="/downloads"
              className="flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[10px] text-gray-700 hover:bg-gray-100 md:flex-row md:gap-2 md:px-3 md:text-xs"
            >
              <span>Downloads</span>
            </Link>
            <Link
              href="/plans"
              className="flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[10px] text-gray-700 hover:bg-gray-100 md:flex-row md:gap-2 md:px-3 md:text-xs"
            >
              <span>Upgrade plan</span>
            </Link>

            {User?.channelname ? (
              <Link href={`/channel/${User._id || User.id}`} className="w-full block">Your channel</Link>
            ) : (
              <button
                onClick={() => setisdialogopen(true)}
                className="w-full px-2 py-2 text-left text-xs font-medium text-blue-600"
              >
                Create a channel
              </button>
            )}
          </div>
        )}
      </nav>
      <Channeldialogue isopen={isdialogopen} onclose={() => setisdialogopen(false)} mode="create" />
    </aside>
  );
};

export default Sidebar;