export default function Marquee({ items = [], separator = '✦', className = '', itemClassName = '', speed = '' }) {
  const row = [...items, ...items]
  return (
    <div className={`overflow-hidden relative ${className}`}>
      <div
        className={`flex w-max items-center gap-8 ${speed || 'animate-marquee'}`}
        style={{ willChange: 'transform' }}
      >
        {row.map((item, i) => (
          <span key={i} className={`flex items-center gap-8 ${itemClassName}`}>
            <span>{item}</span>
            <span className="text-primary/70">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  )
}