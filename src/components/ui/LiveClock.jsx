import { useState, useEffect } from 'react'

export default function LiveClock({ className = '', showSeconds = true }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const options = {
    timeZone: 'Asia/Colombo',
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    ...(showSeconds ? { second: '2-digit' } : {}),
  }

  const timeStr = time.toLocaleTimeString('en-IN', options)
  const dateStr = time.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Colombo',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <span className={`inline-flex flex-col items-end leading-tight ${className}`}>
      <span className="font-semibold tabular-nums">{timeStr}</span>
      <span className="text-[10px] uppercase tracking-wider opacity-70">{dateStr}</span>
    </span>
  )
}
