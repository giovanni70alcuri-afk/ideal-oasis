import './Loading.css'

export function Spinner({ size = 'md', color = 'primary' }) {
  const sizes = {
    sm: 20,
    md: 32,
    lg: 48,
    xl: 64
  }

  const colors = {
    primary: 'var(--primary)',
    white: 'white',
    dark: 'var(--text-primary)'
  }

  return (
    <div
      className="spinner"
      style={{
        width: sizes[size],
        height: sizes[size],
        borderTopColor: colors[color]
      }}
    />
  )
}

export function LoadingOverlay({ text = 'Caricamento...' }) {
  return (
    <div className="loading-overlay">
      <div className="loading-overlay-content">
        <Spinner size="lg" />
        <p className="loading-overlay-text">{text}</p>
      </div>
    </div>
  )
}

export function InlineLoader({ text }) {
  return (
    <div className="inline-loader">
      <Spinner size="sm" />
      {text && <span className="inline-loader-text">{text}</span>}
    </div>
  )
}

export function Skeleton({ width = '100%', height = 20, radius }) {
  return (
    <div
      className="skeleton"
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: radius || 'var(--border-radius)'
      }}
    />
  )
}

export function SkeletonText({ lines = 3, lastLineWidth = '60%' }) {
  return (
    <div className="skeleton-text">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? lastLineWidth : '100%'}
          height={16}
        />
      ))}
    </div>
  )
}
