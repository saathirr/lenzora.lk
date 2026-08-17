import { motion } from 'framer-motion'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
}

const word = {
  hidden: { opacity: 0, y: 22, rotateX: 45 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { type: 'spring', stiffness: 210, damping: 22 },
  },
}

export default function AnimatedHeading({ text, gradient = [], className = '', style = {} }) {
  const words = text.split(' ')
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      className={`perspective-1000 ${className}`}
      style={style}
    >
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          variants={word}
          className={`inline-block mr-[0.26em] ${gradient.includes(w) ? 'text-gradient-animated' : ''}`}
        >
          {w.replace(/\*/g, '')}
        </motion.span>
      ))}
    </motion.div>
  )
}