import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import logo from "@/assets/logo.png";
import "./cream.css";

/** Adiciona .is-in nos elementos .cv-reveal dentro do container quando entram na tela. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll<HTMLElement>(".cv-reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

export const delay = (ms: number) => ({ "--cv-delay": `${ms}ms` }) as CSSProperties;

export function BrandMark({ size = 40, withName = true }: { size?: number; withName?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <img src={logo} alt="Canva Viagem" width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />
      {withName && <span className="whitespace-nowrap text-[16px] font-extrabold tracking-[-0.02em] sm:text-[19px]">Canva Viagem</span>}
    </span>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`cv-eyebrow ${className}`}>{children}</span>;
}
