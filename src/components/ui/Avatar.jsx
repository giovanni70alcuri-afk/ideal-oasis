import './Avatar.css'

export function Avatar({
  src,
  alt = '',
  size = 'md',
  rounded = true,
  status,
  onClick
}) {
  const sizes = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
    xxl: 120
  }

  const style = {
    width: sizes[size],
    height: sizes[size],
    fontSize: sizes[size] * 0.4
  }

  const initials = alt
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const classNames = [
    'avatar',
    `avatar-${size}`,
    rounded && 'avatar-rounded',
    onClick && 'avatar-clickable',
    status && `avatar-status-${status}`
  ].filter(Boolean).join(' ')

  return (
    <div
      className={classNames}
      style={style}
      onClick={onClick}
    >
      {src ? (
        <img src={src} alt={alt || 'Avatar'} className="avatar-image" />
      ) : (
        <span className="avatar-initials">{initials || '?'}</span>
      )}
      
      {status && (
        <span
          className="avatar-status-dot"
          style={{
            background: status === 'online' ? '#10b981' : status === 'busy' ? '#ef4444' : '#f59e0b'
          }}
        />
      )}
    </div>
  )
}

export function AvatarGroup({ avatars, max = 4, size = 'md' }) {
  const display = avatars.slice(0, max)
  const remaining = avatars.length - max

  return (
    <div className={`avatar-group avatar-group-${size}`}>
      {display.map((avatar, i) => (
        <Avatar key={i} {...avatar} size={size} />
      ))}
      {remaining > 0 && (
        <div className={`avatar-overflow avatar-overflow-${size}`}>
          +{remaining}
        </div>
      )}
    </div>
  )
}
