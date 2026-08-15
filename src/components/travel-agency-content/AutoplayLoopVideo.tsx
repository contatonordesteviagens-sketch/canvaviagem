import { useCallback, useEffect, useRef } from "react";
import type { ReactEventHandler } from "react";

type AutoplayLoopVideoProps = {
  src: string;
  label: string;
  className?: string;
  mobileAnimationSrc?: string;
  onError?: ReactEventHandler<HTMLVideoElement>;
};

export default function AutoplayLoopVideo({ src, label, className = "", mobileAnimationSrc, onError }: AutoplayLoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const resumePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video || document.visibilityState === "hidden") return;

    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "true");
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
    const retryTimers = [250, 1000, 2500].map((delay) => window.setTimeout(resumePlayback, delay));
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) resumePlayback();
    }, { threshold: 0.05 });

    video.addEventListener("loadedmetadata", resumePlayback);
    video.addEventListener("loadeddata", resumePlayback);
    video.addEventListener("canplay", resumePlayback);
    document.addEventListener("visibilitychange", resumeWhenVisible);
    window.addEventListener("pageshow", resumeWhenVisible);
    window.addEventListener("focus", resumeWhenVisible);
    observer.observe(video);
    resumePlayback();

    return () => {
      retryTimers.forEach((timer) => window.clearTimeout(timer));
      observer.disconnect();
      video.removeEventListener("loadedmetadata", resumePlayback);
      video.removeEventListener("loadeddata", resumePlayback);
      video.removeEventListener("canplay", resumePlayback);
      document.removeEventListener("visibilitychange", resumeWhenVisible);
      window.removeEventListener("pageshow", resumeWhenVisible);
      window.removeEventListener("focus", resumeWhenVisible);
    };
  }, [resumePlayback]);

  return (
    <>
      {mobileAnimationSrc && (
        <img
          src={mobileAnimationSrc}
          alt={label}
          draggable={false}
          className={`pointer-events-none block select-none lg:hidden ${className}`}
        />
      )}
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
        onEnded={resumePlayback}
        onError={onError}
        onContextMenu={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
        className={`pointer-events-none select-none ${mobileAnimationSrc ? "hidden lg:block" : ""} ${className}`}
      >
        <source src={src} type="video/mp4" />
      </video>
    </>
  );
}
