import { useCallback, useEffect, useRef } from "react";

type AutoplayLoopVideoProps = {
  src: string;
  label: string;
  className?: string;
};

export default function AutoplayLoopVideo({ src, label, className = "" }: AutoplayLoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const resumePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video || document.visibilityState === "hidden") return;

    video.defaultMuted = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    if (video.paused) void video.play().catch(() => undefined);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const resumeWhenVisible = () => resumePlayback();

    video.addEventListener("loadeddata", resumePlayback);
    video.addEventListener("canplay", resumePlayback);
    document.addEventListener("visibilitychange", resumeWhenVisible);
    window.addEventListener("pageshow", resumeWhenVisible);
    resumePlayback();

    return () => {
      video.removeEventListener("loadeddata", resumePlayback);
      video.removeEventListener("canplay", resumePlayback);
      document.removeEventListener("visibilitychange", resumeWhenVisible);
      window.removeEventListener("pageshow", resumeWhenVisible);
    };
  }, [resumePlayback]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      controls={false}
      disablePictureInPicture
      controlsList="nodownload nofullscreen noplaybackrate noremoteplayback"
      tabIndex={-1}
      draggable={false}
      aria-label={label}
      onPause={resumePlayback}
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
      className={`pointer-events-none select-none ${className}`}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
