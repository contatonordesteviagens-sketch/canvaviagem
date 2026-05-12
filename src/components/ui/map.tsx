import { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DottedMap from "dotted-map";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string; labelOffset?: { x: number; y: number } };
    end: { lat: number; lng: number; label?: string; labelOffset?: { x: number; y: number } };
  }>;
  lineColor?: string;
  showLabels?: boolean;
  labelClassName?: string;
  animationDuration?: number;
  loop?: boolean;
}

export function WorldMap({ 
  dots = [], 
  lineColor = "#00E5FF", 
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
        return new DottedMapClass({ height: 60, grid: "diagonal" });
      } catch (e) {
        console.error("Failed to initialize DottedMap:", e);
        return null;
      }
    },
    []
  );

  const mapData = useMemo(() => {
    if (!map) return null;
    try {
      const points = map.getPoints();
      const { width, height } = (map as any).image || { width: 800, height: 400 };
      return { points, width, height };
    } catch (e) {
      return null;
    }
  }, [map]);

  const projectPoint = (lat: number, lng: number) => {
    if (!map) return { x: 0, y: 0 };
    try {
      // Call internal projected coordinate API for 100% perfect alignment with background points
      const pin = map.getPin({ lat, lng });
      return pin ? { x: pin.x, y: pin.y } : { x: 0, y: 0 };
    } catch (e) {
      return { x: 0, y: 0 };
    }
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - (mapData ? mapData.height * 0.15 : 50); // dynamic curve
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  const staggerDelay = 0.3;
  const totalAnimationTime = dots.length * staggerDelay + animationDuration;
  const pauseTime = 2;
  const fullCycleDuration = totalAnimationTime + pauseTime;

  // Pre-rendered memoized dots background for supreme performance
  const backgroundPoints = useMemo(() => {
    if (!mapData) return null;
    return mapData.points.map((pt: any, i: number) => (
      <circle 
        key={`bg-pt-${i}`} 
        cx={pt.x} 
        cy={pt.y} 
        r={0.25} 
        fill="#FFFFFF" 
        opacity={0.18}
      />
    ));
  }, [mapData]);

  if (!mapData) return null;

  const { width, height } = mapData;

  return (
    <div className="w-full h-[320px] md:h-[450px] lg:h-[520px] relative font-sans overflow-hidden" style={{ background: "transparent" }}>
      {/* Radial light effect */}
      <div className="absolute inset-0 pointer-events-none" style={{ 
        background: "radial-gradient(circle at 50% 50%, rgba(0, 229, 255, 0.06) 0%, transparent 60%)",
        zIndex: 0
      }} />

      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full absolute inset-0 pointer-events-auto select-none z-10"
        preserveAspectRatio="xMidYMid slice"
        style={{ transform: "scale(1.15)" }} // Subtle zoom for mobile feel
      >
        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* PERFECTLY ALIGNED BACKGROUND POINTS */}
        <g id="map-background-points">
          {backgroundPoints}
        </g>

        {/* ANIMATED PATHS */}
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          
          // Skip zero projections
          if (startPoint.x === 0 && startPoint.y === 0) return null;
          if (endPoint.x === 0 && endPoint.y === 0) return null;

          const startTime = (i * staggerDelay) / fullCycleDuration;
          const endTime = (i * staggerDelay + animationDuration) / fullCycleDuration;
          const resetTime = totalAnimationTime / fullCycleDuration;
          
          return (
            <g key={`path-group-${i}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="0.8"
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
                  r="1.2"
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

        {/* LABELS AND DESTINATION CIRCLES */}
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          
          if (startPoint.x === 0) return null;

          return (
            <g key={`points-group-${i}`}>
              {/* Start Point */}
              <g key={`start-${i}`}>
                <motion.g className="cursor-pointer" whileHover={{ scale: 1.2 }}>
                  <circle cx={startPoint.x} cy={startPoint.y} r="1.5" fill={lineColor} filter="url(#glow)" />
                  <circle cx={startPoint.x} cy={startPoint.y} r="1.5" fill={lineColor} opacity="0.5">
                    <animate attributeName="r" from="1.5" to="5" dur="2s" begin="0s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.6" to="0" dur="2s" begin="0s" repeatCount="indefinite" />
                  </circle>
                </motion.g>
                
                {showLabels && dot.start.label && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <text
                      x={startPoint.x + (dot.start.labelOffset?.x ?? 0)}
                      y={startPoint.y - 1.5 + (dot.start.labelOffset?.y ?? 0)}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="1.8"
                      fontWeight="800"
                      className="pointer-events-none select-none"
                      style={{ 
                        textShadow: "0 0.5px 1px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.9)",
                        letterSpacing: "-0.02em" 
                      }}
                    >
                      {dot.start.label}
                    </text>
                  </motion.g>
                )}
              </g>
              
              {/* End Point */}
              <g key={`end-${i}`}>
                <motion.g className="cursor-pointer" whileHover={{ scale: 1.2 }}>
                  <circle cx={endPoint.x} cy={endPoint.y} r="1.5" fill={lineColor} filter="url(#glow)" />
                  <circle cx={endPoint.x} cy={endPoint.y} r="1.5" fill={lineColor} opacity="0.5">
                    <animate attributeName="r" from="1.5" to="5" dur="2s" begin="0.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.6" to="0" dur="2s" begin="0.5s" repeatCount="indefinite" />
                  </circle>
                </motion.g>
                
                {showLabels && dot.end.label && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <text
                      x={endPoint.x + (dot.end.labelOffset?.x ?? 0)}
                      y={endPoint.y - 1.5 + (dot.end.labelOffset?.y ?? 0)}
                      textAnchor="middle"
                      fill="#00E5FF"
                      fontSize="1.8"
                      fontWeight="800"
                      className="pointer-events-none select-none"
                      style={{ 
                        textShadow: "0 0.5px 1px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.9)",
                        letterSpacing: "-0.02em" 
                      }}
                    >
                      {dot.end.label}
                    </text>
                  </motion.g>
                )}
              </g>
            </g>
          );
        })}
      </svg>
      
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#03070F] to-transparent z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#03070F] to-transparent z-20 pointer-events-none" />
    </div>
  );
}
