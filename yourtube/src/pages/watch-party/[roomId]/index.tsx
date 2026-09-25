import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

type Party = {
  roomId: string;
  videoId: string;
  videoPath: string;
  hostId: string;
  playing: boolean;
  currentTime: number;
  updatedAt: number;
  participants: { id: string; name: string; muted: boolean; cameraOn: boolean }[];
  messages: { id: string; name: string; text: string; createdAt: string }[];
};

const WatchPartyPage = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const { user } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [party, setParty] = useState<Party | null>(null);
  const [message, setMessage] = useState("");
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [error, setError] = useState("");

  const userId = user?._id || user?.id;

  useEffect(() => {
    if (!roomId || !userId) return;
    const join = async () => {
      try {
        const response = await axiosInstance.post(`/watchparty/${roomId}/join`, { userId, name: user.name || "Guest" });
        setParty(response.data);
      } catch (requestError: any) {
        setError(requestError.response?.data?.message || "Unable to join watch party.");
      }
    };
    void join();
  }, [roomId, userId]);

  useEffect(() => {
    if (!roomId || !userId) return;
    const poll = window.setInterval(async () => {
      try {
        const response = await axiosInstance.get(`/watchparty/${roomId}`);
        setParty(response.data);
        if (videoRef.current && response.data.hostId === userId) return;
        if (videoRef.current && Math.abs(videoRef.current.currentTime - response.data.currentTime) > 2) {
          videoRef.current.currentTime = response.data.currentTime;
        }
        if (videoRef.current && response.data.playing && videoRef.current.paused) void videoRef.current.play();
        if (videoRef.current && !response.data.playing && !videoRef.current.paused) videoRef.current.pause();
      } catch {
        // The initial join request displays the actionable error.
      }
    }, 2000);
    return () => window.clearInterval(poll);
  }, [roomId, userId]);

  useEffect(() => {
    if (!roomId || !userId) return;
    const heartbeat = window.setInterval(() => {
      void axiosInstance.post(`/watchparty/${roomId}/heartbeat`, { userId, muted, cameraOn });
    }, 10_000);
    return () => window.clearInterval(heartbeat);
  }, [roomId, userId, muted, cameraOn]);

  const updatePlayback = async (playing: boolean) => {
    if (!party || party.hostId !== userId || !videoRef.current) return;
    await axiosInstance.patch(`/watchparty/${party.roomId}/state`, {
      userId,
      playing,
      currentTime: videoRef.current.currentTime,
    });
  };

  const toggleCamera = async () => {
    if (cameraOn) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraOn(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (cameraRef.current) cameraRef.current.srcObject = stream;
      setCameraOn(true);
    } catch {
      toast.error("Camera permission was not granted.");
    }
  };

  const toggleScreenShare = async () => {
    if (screenSharing) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setScreenSharing(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      streamRef.current = stream;
      if (cameraRef.current) cameraRef.current.srcObject = stream;
      setScreenSharing(true);
      stream.getVideoTracks()[0].onended = () => setScreenSharing(false);
    } catch {
      toast.error("Screen sharing was cancelled.");
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !party || !userId) return;
    await axiosInstance.post(`/watchparty/${party.roomId}/messages`, { userId, name: user.name || "Guest", text: message });
    setMessage("");
    const response = await axiosInstance.get(`/watchparty/${party.roomId}`);
    setParty(response.data);
  };

  if (!user) return <p className="p-6">Sign in to join a watch party.</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!party) return <p className="p-6">Joining watch party...</p>;

  const isHost = party.hostId === userId;
  const videoUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/${String(party.videoPath || "").replace(/^[/\\]+/, "")}`;

  return (
    <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1fr_320px]">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold">Watch party</h1>
            <p className="text-xs text-gray-500">Room: {party.roomId}</p>
          </div>
          <button onClick={() => { void navigator.clipboard.writeText(window.location.href); toast.success("Invite link copied."); }} className="rounded bg-blue-600 px-3 py-2 text-sm text-white">
            Copy invite link
          </button>
        </div>
        <div className="overflow-hidden rounded-lg bg-black">
          <video
            ref={videoRef}
            className="aspect-video w-full"
            controls
            src={videoUrl}
            onPlay={() => void updatePlayback(true)}
            onPause={() => void updatePlayback(false)}
            onSeeked={() => void updatePlayback(!videoRef.current?.paused)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setMuted((value) => !value)} className="rounded border px-3 py-2 text-sm">{muted ? "Unmute" : "Mute"}</button>
          <button onClick={() => void toggleCamera()} className="rounded border px-3 py-2 text-sm">{cameraOn ? "Camera off" : "Camera on"}</button>
          <button onClick={() => void toggleScreenShare()} className="rounded border px-3 py-2 text-sm">{screenSharing ? "Stop sharing" : "Share screen"}</button>
          <button onClick={() => router.push("/")} className="rounded bg-red-600 px-3 py-2 text-sm text-white">Leave call</button>
          {isHost && <span className="rounded bg-gray-100 px-3 py-2 text-sm">You control playback</span>}
        </div>
        {(cameraOn || screenSharing) && <video ref={cameraRef} autoPlay muted className="max-w-xs rounded bg-black" />}
      </section>
      <aside className="space-y-4 rounded-lg border bg-white p-4">
        <div>
          <h2 className="font-semibold">Participants ({party.participants.length})</h2>
          <ul className="mt-2 space-y-1 text-sm">{party.participants.map((participant) => <li key={participant.id}>{participant.name}{participant.id === party.hostId ? " (host)" : ""} {participant.muted ? "🔇" : ""}</li>)}</ul>
        </div>
        <div>
          <h2 className="font-semibold">Chat</h2>
          <div className="my-2 max-h-64 space-y-2 overflow-y-auto text-sm">{party.messages.map((item) => <p key={item.id}><strong>{item.name}:</strong> {item.text}</p>)}</div>
          <div className="flex gap-2">
            <input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void sendMessage(); }} className="min-w-0 flex-1 rounded border px-2 py-1" placeholder="Chat with the party" />
            <button onClick={() => void sendMessage()} className="rounded bg-blue-600 px-3 py-1 text-white">Send</button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default WatchPartyPage;
