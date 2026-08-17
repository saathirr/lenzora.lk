import { motion } from 'framer-motion'

const positions = [
  'w-[420px] h-[420px] -top-24 -left-28',
  'w-[380px] h-[380px] top-1/4 -right-32',
  'w-[340px] h-[340px] bottom-0 left-1/3',
  'w-[280px] h-[280px] top-10 right-1/4',
]

const colors = ['bg-primary/25', 'bg-accent2/25', 'bg-accent3/25', 'bg-secondary/25']

export default function FloatingOrbs({ count = 3, className = '', intensity = 0.5 }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl animate-blob ${positions[i % positions.length]} ${colors[i % colors.length]}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, intensity, intensity * 0.6, intensity] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: i * 1.1 }}
        />
      ))}
    </div>
  )
}