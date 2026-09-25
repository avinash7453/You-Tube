import React, { useState } from 'react'
import Link from "next/link";
import { Clock3, Compass, History as HistoryIcon, Home, ThumbsUp, User } from "lucide-react";
import Channeldialogue from "@/components/Channeldialogue";
import { useUser } from '@/lib/AuthContext';

const Sidebar = () => {
  const { User } = useUser();
  const [isdialogopen, setisdialogopen] = useState(false)

  return (
    <aside className="hidden w-64 border-r bg-gray-50 p-4 lg:block">
      <nav className="space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>

        <Link
          href="/explore"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
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
          <div className="mt-4 border-t pt-3">
            <Link
              href="/history"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              <HistoryIcon className="h-4 w-4" />
              <span>History</span>
            </Link>

            <Link
              href="/liked"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>Liked Videos</span>
            </Link>

            <Link
              href="/watch-later"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              <Clock3 className="h-4 w-4" />
              <span>Watch Later</span>
            </Link>

            {User?. channelname ? (
              <Link href={`/channel/${User.id}`} className="w-full block">Your channel</Link>
            ) : (
              <button
                onClick={() => setisdialogopen(true)}
                className="w-full text-left text-blue-600 font-medium"
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