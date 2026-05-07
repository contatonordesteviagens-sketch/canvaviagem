"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface TimelineContentProps {
  children: ReactNode;
  as?: "div" | "p" | "span" | "h1" | "h2" | "h3";
  animationNum?: number;
  timelineRef?: React.RefObject<HTMLElement | null>;
  customVariants?: any;
  className?: string;
}

export const TimelineContent = ({
  children,
  as = "div",
  animationNum = 0,
  timelineRef,
  customVariants,
  className,
}: TimelineContentProps) => {
  const Component = (motion as any)[as] || motion.div;

  const defaultVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const variants = customVariants || defaultVariants;

  return (
    <Component
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      custom={animationNum}
      className={className}
    >
      {children}
    </Component>
  );
};
