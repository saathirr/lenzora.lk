import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      style={{ scaleX }}
      className="scroll-progress-bar fixed top-0 left-0 right-0 h-1 z-[70] origin-left bg-gradient-to-r from-primary via-accent2 to-accent3"
    />
  )
}