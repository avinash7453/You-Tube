import { useState } from "react";
import Link from "next/link";
import { Bell, Menu, Mic, Moon, Search, Sun, User as UserIcon, Video } from "lucide-react";
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
  const { User, loading, logout, login, handlegooglesignin } = useUser();

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
          <Button variant="ghost" size="icon" type="button" aria-label="Open menu">
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
          <Button type="submit" variant="ghost" size="icon-sm" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Voice search">
            <Mic className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
          ) : User ? (
            <>
              <Button variant="ghost" size="icon" type="button" aria-label="Create video">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" type="button" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" type="button" aria-label="Change theme" onClick={handleThemeChange}>
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
                <DropdownMenuContent className="w-56 bg-white shadow-md border border-gray-200" align="end">
                  {User?.channelname ? (
                    <DropdownMenuItem>
                      <Link href={`/channel/${User._id || User.id}`} className="w-full block text-blue-600 font-medium">
                        Your channel
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                      <button
                        onClick={() => setIsDialogOpen(true)}
                        className="w-full text-left text-blue-600 font-medium"
                      >
                        Create a channel
                      </button>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem>
                    <Link href="/history" className="w-full block">History</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/liked" className="w-full block">Liked videos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/watch-later" className="w-full block">Watch later</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/downloads" className="w-full block">Downloads</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/plans" className="w-full block">Upgrade plan</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 border-t border-gray-200" />
                  <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={logout}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button className="flex items-center gap-2" onClick={handlegooglesignin}>
              <UserIcon className="w-4 h-4" />
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