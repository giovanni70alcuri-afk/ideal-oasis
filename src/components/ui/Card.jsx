import './Card.css'

export function Card({ children, className = '', padding = true, hover = false }) {
  return (
    <div className={[
      'card',
      padding && 'card-padding',
      hover && 'card-hover',
      className
    ].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={['card-header', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }) {
  return (
    <div className={['card-body', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={['card-footer', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
