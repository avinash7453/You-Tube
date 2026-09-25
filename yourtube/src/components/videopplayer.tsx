import { useEffect, useRef, useState } from "react";
import {
  Maximize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
  };
  nextVideo?: { _id: string; videotitle: string };
  onNext?: () => void;
}

const formatTime = (value: number) => {
  if (!Number.isFinite(value)) return "0:00";
  const seconds = Math.floor(value);
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
};

export default function VideoPlayer({ video, nextVideo, onNext }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef({ time: 0, x: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoSource = video?.filepath
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/${video.filepath.replace(/^[/\\]+/, "")}`
    : "/video/vdo.mp4";

  useEffect(() => {
    setIsLoading(true);
    setCurrentTime(0);
    setIsPlaying(false);
  }, [video._id]);

  useEffect(() => {
    const handleFullscreen = () => setIsFullscreen(document.fullscreenElement === playerRef.current);
    document.addEventListener("fullscreenchange", handleFullscreen);
    return () => document.removeEventListener("fullscreenchange", handleFullscreen);
  }, []);

  const togglePlay = () => {
    const element = videoRef.current;
    if (!element) return;
    if (element.paused) {
      void element.play();
    } else {
      element.pause();
    }
  };

  const seek = (amount: number) => {
    if (videoRef.current) videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + amount));
  };

  const handleTap = (event: React.TouchEvent<HTMLVideoElement>) => {
    const now = Date.now();
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.changedTouches[0]?.clientX - rect.left;
    if (now - lastTapRef.current.time < 300) {
      seek(x < rect.width / 2 ? -10 : 10);
      lastTapRef.current = { time: 0, x };
    } else {
      lastTapRef.current = { time: now, x };
    }
  };

  const toggleFullscreen = async () => {
    if (!playerRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await playerRef.current.requestFullscreen();
    }
  };

  return (
    <div ref={playerRef} className="group relative aspect-video overflow-hidden rounded-lg bg-black text-white">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 text-sm">
          Loading video...
        </div>
      )}
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        playsInline
        preload="metadata"
        poster="/placeholder.svg?height=480&width=854"
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration);
          setIsLoading(false);
        }}
        onCanPlay={() => setIsLoading(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsPlaying(true);
          setIsLoading(false);
        }}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onEnded={() => {
          setIsPlaying(false);
          if (onNext) onNext();
        }}
        onDoubleClick={(event) => seek(event.nativeEvent.offsetX < event.currentTarget.clientWidth / 2 ? -10 : 10)}
        onTouchEnd={handleTap}
      >
        <source src={videoSource} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-3 pb-3 pt-10 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
        <input
          aria-label="Seek video"
          type="range"
          min={0}
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) => {
            const value = Number(event.target.value);
            setCurrentTime(value);
            if (videoRef.current) videoRef.current.currentTime = value;
          }}
          className="mb-2 w-full accent-red-600"
        />
        <div className="flex items-center gap-2">
          <button aria-label={isPlaying ? "Pause" : "Play"} onClick={togglePlay} className="rounded p-1 hover:bg-white/20">
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button aria-label="Rewind 10 seconds" onClick={() => seek(-10)} className="rounded p-1 hover:bg-white/20">
            <RotateCcw size={18} />
          </button>
          <button aria-label="Forward 10 seconds" onClick={() => seek(10)} className="rounded p-1 hover:bg-white/20">
            <RotateCw size={18} />
          </button>
          <button
            aria-label={volume ? "Mute" : "Unmute"}
            onClick={() => {
              if (!videoRef.current) return;
              videoRef.current.muted = Boolean(volume);
              setVolume(volume ? 0 : 1);
            }}
            className="rounded p-1 hover:bg-white/20"
          >
            {volume ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <input
            aria-label="Volume"
            type="range"
            min={0}
            max={1}
            step="0.05"
            value={volume}
            onChange={(event) => {
              const value = Number(event.target.value);
              setVolume(value);
              if (videoRef.current) {
                videoRef.current.volume = value;
                videoRef.current.muted = value === 0;
              }
            }}
            className="w-20 accent-red-600"
          />
          <span className="text-xs tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
          <span className="flex-1" />
          {nextVideo && onNext && (
            <button onClick={onNext} className="rounded px-2 py-1 text-xs hover:bg-white/20">
              Next: {nextVideo.videotitle}
            </button>
          )}
          <button aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"} onClick={toggleFullscreen} className="rounded p-1 hover:bg-white/20">
            <Maximize size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
