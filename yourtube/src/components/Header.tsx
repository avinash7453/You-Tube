import { useState } from "react";
import Link from "next/link";
import { Bell, LoaderCircle, Menu, Mic, Moon, Search, Sun, User as UserIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import Channeldialogue from "@/components/Channeldialogue";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

const Header = () => {
  const { User, loading, signInLoading, logout, login, handlegooglesignin } = useUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const router = useRouter();

  const handleThemeChange = async () => {
    if (!User) return;
    const theme = User.theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    try {
      const response = await axiosInstance.patch(`/user/update/${User._id || User.id}`, { theme });
      login(response.data.result);
    } catch (error) {
      console.error("Unable to save theme preference:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e as any);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" type="button" aria-label="Open menu" className="text-gray-700 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white">
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/" className="group flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-red-500 via-rose-600 to-orange-500 p-1.5 shadow-md shadow-red-200 transition group-hover:scale-105">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <path d="M10 15l5-3-5-3v6z" />
              </svg>
            </div>
            <span className="bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">YourTube</span>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="hidden max-w-xl flex-1 items-center gap-1 md:flex">
          <div className="flex w-full items-center rounded border border-gray-300 bg-white px-3 py-1">
            <Search className="mr-2 h-4 w-4 text-gray-500" />
            <input
              type="search"
              value={searchQuery}
              onKeyPress={handleKeyPress}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full border-0 bg-transparent outline-none"
            />
          </div>
          <Button type="submit" variant="ghost" size="icon-sm" aria-label="Search" className="text-gray-700 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white">
            <Search className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Voice search" className="text-gray-700 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white">
            <Mic className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center gap-2">
          {loading ? (
            <Button type="button" disabled aria-busy="true" className="flex items-center gap-2 bg-blue-600 text-white opacity-80">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Sign in
            </Button>
          ) : User ? (
            <>
              <Button variant="ghost" size="icon" type="button" aria-label="Create video" className="text-gray-700 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" type="button" aria-label="Notifications" className="text-gray-700 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" type="button" aria-label="Change theme" onClick={handleThemeChange} className="text-gray-700 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white">
                {User.theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* Profile Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700 hover:ring-2 hover:ring-gray-400 transition cursor-pointer overflow-hidden outline-none">
                  {User.image ? (
                    <img src={User.image} alt={User.name || "User"} className="h-full w-full object-cover" />
                  ) : (
                    User.name ? User.name.charAt(0).toUpperCase() : "U"
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 border border-gray-200 bg-white text-gray-900 shadow-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" align="end">
                  {User?.channelname ? (
                    <DropdownMenuItem>
                      <Link href={`/channel/${User._id || User.id}`} className="block w-full rounded-md px-2 py-1.5 font-semibold text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-gray-800">
                        Your channel
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                      <button
                        onClick={() => setIsDialogOpen(true)}
                        className="w-full rounded-md px-2 py-1.5 text-left font-semibold text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-gray-800"
                      >
                        Create a channel
                      </button>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem>
                    <Link href="/history" className="block w-full rounded-md px-2 py-1.5 text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800">History</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/liked" className="block w-full rounded-md px-2 py-1.5 text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800">Liked videos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/watch-later" className="block w-full rounded-md px-2 py-1.5 text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800">Watch later</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/downloads" className="block w-full rounded-md px-2 py-1.5 text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800">Downloads</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/plans" className="block w-full rounded-md px-2 py-1.5 font-semibold text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-gray-800">Upgrade plan</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 border-t border-gray-200" />
                  <DropdownMenuItem className="cursor-pointer font-semibold text-red-600 dark:text-red-400" onClick={logout}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              type="button"
              className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
              onClick={handlegooglesignin}
              disabled={signInLoading}
              aria-busy={signInLoading}
            >
              {signInLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserIcon className="h-4 w-4" />}
              Sign in
            </Button>
          )}
        </div>
      </div>
      <Channeldialogue isopen={isDialogOpen} onclose={() => setIsDialogOpen(false)} mode="create" />
    </header>
  );
};

export default Header;