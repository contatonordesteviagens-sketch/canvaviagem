"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AnimatedTextProps {
    text?: string;
    className?: string;
    shadowColors?: {
        first?: string;
        second?: string;
        third?: string;
        fourth?: string;
        glow?: string;
    };
}

export function TextRewind({
    text = "CANVA VIAGEM",
    className = "",
    shadowColors = {
        first: "#07bccc",
        second: "#e601c0",
        third: "#e9019a",
        fourth: "#f40468",
        glow: "#f40468",
    },
}: AnimatedTextProps) {
    const textShadowStyle = {
        textShadow: `2px 2px 0px ${shadowColors.first}, 
                     4px 4px 0px ${shadowColors.second}, 
                     6px 6px 0px ${shadowColors.third}, 
                     8px 8px 0px ${shadowColors.fourth}, 
                     10px 10px 5px ${shadowColors.glow}`,
    };

    const noShadowStyle = {
        textShadow: "none",
    };

    return (
        <div className="flex items-center">
            <motion.div
                className={cn(
                    "cursor-pointer text-xl md:text-2xl font-black",
                    "transition-all duration-200 ease-in-out tracking-tighter",
                    "text-black dark:text-white italic uppercase",
                    className
                )}
                style={textShadowStyle}
                whileHover={noShadowStyle}
            >
                {text}
            </motion.div>
        </div>
    );
}
