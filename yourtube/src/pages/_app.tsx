import Header from "@/components/Header";
import Sidebar from "@/components/sidebar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "sonner";
import { UserProvider } from "../lib/AuthContext"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <div className="min-h-screen bg-background text-foreground">
        <title>Your-Tube Clone</title>
        <Header />
        <Toaster />
        <div className="flex">
          <Sidebar />
          <main className="min-w-0 flex-1">
            <Component {...pageProps} />
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
