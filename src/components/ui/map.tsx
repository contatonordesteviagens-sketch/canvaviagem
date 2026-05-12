import { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DottedMap from "dotted-map";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
  showLabels?: boolean;
  labelClassName?: string;
  animationDuration?: number;
  loop?: boolean;
}

export function WorldMap({ 
  dots = [], 
  lineColor = "#00E5FF", // Customizado para o cyan do Canva Viagem
  showLabels = true,
  labelClassName = "text-sm",
  animationDuration = 2,
  loop = true
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  // Manually forcing dark theme colors for the SalesPage integration
  const isDark = true;

  const map = useMemo(
    () => {
      try {
        // Handle various export types dynamically to prevent "not a constructor" error
        const DottedMapClass = (DottedMap as any).default || DottedMap;
        return new DottedMapClass({ height: 100, grid: "diagonal" });
      } catch (e) {
        console.error("Failed to initialize DottedMap:", e);
        return null;
      }
    },
    []
  );

  const svgMap = useMemo(
    () => {
      if (!map) return "";
      try {
        return map.getSVG({
          radius: 0.22,
          color: "#FFFFFF30",
          shape: "circle",
          backgroundColor: "#03070F",
        });
      } catch (e) {
        console.error("Failed to generate SVG map:", e);
        return "";
      }
    },
    [map]
  );

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  // Calculate animation timing
  const staggerDelay = 0.3;
  const totalAnimationTime = dots.length * staggerDelay + animationDuration;
  const pauseTime = 2; // Pause for 2 seconds when all paths are drawn
  const fullCycleDuration = totalAnimationTime + pauseTime;

  if (!svgMap) return null;

  return (
    <div className="w-full h-[360px] md:h-[480px] lg:h-[550px] relative font-sans overflow-hidden" style={{ background: "transparent" }}>
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ 
        background: "radial-gradient(circle at 50% 50%, rgba(0, 229, 255, 0.05) 0%, transparent 70%)",
        zIndex: 0
      }} />

      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full pointer-events-none select-none object-cover opacity-60"
        style={{ 
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 90%)", 
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 90%)",
          transform: "scale(1.2)" // Ligeiro zoom para ficar maior no mobile
        }}
        alt="world map"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-auto select-none z-10"
        preserveAspectRatio="xMidYMid slice" // Alterado de meet para slice para cobrir melhor e ficar MAIOR no mobile
      >
        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          
          const startTime = (i * staggerDelay) / fullCycleDuration;
          const endTime = (i * staggerDelay + animationDuration) / fullCycleDuration;
          const resetTime = totalAnimationTime / fullCycleDuration;
          
          return (
            <g key={`path-group-${i}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={loop ? {
                  pathLength: [0, 0, 1, 1, 0],
                } : {
                  pathLength: 1
                }}
                transition={loop ? {
                  duration: fullCycleDuration,
                  times: [0, startTime, endTime, resetTime, 1],
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 0,
                } : {
                  duration: animationDuration,
                  delay: i * staggerDelay,
                  ease: "easeInOut",
                }}
              />
              
              {loop && (
                <motion.circle
                  r="4"
                  fill={lineColor}
                  filter="url(#glow)"
                  initial={{ offsetDistance: "0%", opacity: 0 }}
                  animate={{
                    offsetDistance: [null, "0%", "100%", "100%", "100%"],
                    opacity: [0, 0, 1, 0, 0],
                  }}
                  transition={{
                    duration: fullCycleDuration,
                    times: [0, startTime, endTime, resetTime, 1],
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 0,
                  }}
                  style={{
                    offsetPath: `path('${createCurvedPath(startPoint, endPoint)}')`,
                  }}
                />
              )}
            </g>
          );
        })}

        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          
          return (
            <g key={`points-group-${i}`}>
              {/* Start Point */}
              <g key={`start-${i}`}>
                <motion.g
                  onHoverStart={() => setHoveredLocation(dot.start.label || `Location ${i}`)}
                  onHoverEnd={() => setHoveredLocation(null)}
                  className="cursor-pointer"
                  whileHover={{ scale: 1.2 }}
                >
                  <circle
                    cx={startPoint.x}
                    cy={startPoint.y}
                    r="4"
                    fill={lineColor}
                    filter="url(#glow)"
                  />
                  <circle
                    cx={startPoint.x}
                    cy={startPoint.y}
                    r="4"
                    fill={lineColor}
                    opacity="0.5"
                  >
                    <animate attributeName="r" from="4" to="14" dur="2s" begin="0s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.7" to="0" dur="2s" begin="0s" repeatCount="indefinite" />
                  </circle>
                </motion.g>
                
                {showLabels && dot.start.label && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <foreignObject
                      x={startPoint.x - 60}
                      y={startPoint.y - 40}
                      width="120"
                      height="35"
                      className="block overflow-visible"
                    >
                      <div className="flex items-center justify-center h-full w-full">
                        <span className="text-[11px] md:text-[13px] font-black uppercase px-3 py-1.5 rounded-lg bg-black text-white border-2 border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.8)] tracking-wide">
                          {dot.start.label}
                        </span>
                      </div>
                    </foreignObject>
                  </motion.g>
                )}
              </g>
              
              {/* End Point */}
              <g key={`end-${i}`}>
                <motion.g
                  onHoverStart={() => setHoveredLocation(dot.end.label || `Destination ${i}`)}
                  onHoverEnd={() => setHoveredLocation(null)}
                  className="cursor-pointer"
                  whileHover={{ scale: 1.2 }}
                >
                  <circle
                    cx={endPoint.x}
                    cy={endPoint.y}
                    r="4"
                    fill={lineColor}
                    filter="url(#glow)"
                  />
                  <circle
                    cx={endPoint.x}
                    cy={endPoint.y}
                    r="4"
                    fill={lineColor}
                    opacity="0.5"
                  >
                    <animate attributeName="r" from="4" to="14" dur="2s" begin="0.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.7" to="0" dur="2s" begin="0.5s" repeatCount="indefinite" />
                  </circle>
                </motion.g>
                
                {showLabels && dot.end.label && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <foreignObject
                      x={endPoint.x - 60}
                      y={endPoint.y - 40}
                      width="120"
                      height="35"
                      className="block overflow-visible"
                    >
                      <div className="flex items-center justify-center h-full w-full">
                        <span className="text-[11px] md:text-[13px] font-black uppercase px-3 py-1.5 rounded-lg bg-black text-[#00E5FF] border-2 border-[#00E5FF]/30 shadow-[0_4px_20px_rgba(0,229,255,0.2)] tracking-wide">
                          {dot.end.label}
                        </span>
                      </div>
                    </foreignObject>
                  </motion.g>
                )}
              </g>
            </g>
          );
        })}
      </svg>
      
      {/* Fade superior e inferior para mesclar com a página */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#03070F] to-transparent z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#03070F] to-transparent z-20 pointer-events-none" />
    </div>
  );
}
