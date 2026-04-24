import { useEffect, useRef, useState } from "react"

interface MouseVector {
  position: { x: number; y: number }
  vector: { x: number; y: number }
}

export function useMouseVector(
  containerRef?: React.RefObject<HTMLElement>
): MouseVector {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [vector, setVector] = useState({ x: 0, y: 0 })
  const lastPosition = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const target = containerRef?.current ?? window

    const handleMouseMove = (e: Event) => {
      const mouseEvent = e as MouseEvent
      const rect = containerRef?.current?.getBoundingClientRect()
      const x = rect ? mouseEvent.clientX - rect.left : mouseEvent.clientX
      const y = rect ? mouseEvent.clientY - rect.top : mouseEvent.clientY

      setVector({
        x: x - lastPosition.current.x,
        y: y - lastPosition.current.y,
      })
      lastPosition.current = { x, y }
      setPosition({ x, y })
    }

    target.addEventListener("mousemove", handleMouseMove)
    return () => target.removeEventListener("mousemove", handleMouseMove)
  }, [containerRef])

  return { position, vector }
}
