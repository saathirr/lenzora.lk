import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion'

export default function TiltCard({ children, className = '', max = 11, glare = true, scale = 1.02 }) {
  const ref = useRef(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)

  const rx = useSpring(useTransform(my, [0, 1], [max, -max]), { stiffness: 260, damping: 22 })
  const ry = useSpring(useTransform(mx, [0, 1], [-max, max]), { stiffness: 260, damping: 22 })
  const gx = useTransform(mx, [0, 1], [0, 100])
  const gy = useTransform(my, [0, 1], [0, 100])
  const glareBg = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.45) 0%, transparent 42%)`

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width)
    my.set((e.clientY - rect.top) / rect.height)
  }
  const reset = () => {
    mx.set(0.5)
    my.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 950 }}
      whileHover={{ scale }}
      transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      className={`preserve-3d relative ${className}`}
    >
      {children}
      {glare && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit] z-20"
          style={{ background: glareBg, opacity: 0.55 }}
        />
      )}
    </motion.div>
  )
}