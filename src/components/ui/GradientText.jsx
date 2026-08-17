export default function GradientText({ children, animated = false, className = '' }) {
  return (
    <span className={`${animated ? 'text-gradient-animated' : 'text-gradient'} ${className}`}>
      {children}
    </span>
  )
}