import { forwardRef } from 'react'
import './Input.css'

export const Input = forwardRef(function Input({
  label,
  type = 'text',
  error,
  helper,
  fullWidth = true,
  className = '',
  ...props
}, ref) {
  const wrapperClass = [
    'input-wrapper',
    fullWidth && 'input-full',
    error && 'input-error',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapperClass}>
      {label && (
        <label className="input-label" htmlFor={props.id}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className="input"
        {...props}
      />
      {error && <span className="input-error-text">{error}</span>}
      {helper && !error && <span className="input-helper">{helper}</span>}
    </div>
  )
})

export const Textarea = forwardRef(function Textarea({
  label,
  error,
  helper,
  fullWidth = true,
  className = '',
  rows = 4,
  ...props
}, ref) {
  const wrapperClass = [
    'input-wrapper',
    'input-wrapper-textarea',
    fullWidth && 'input-full',
    error && 'input-error',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapperClass}>
      {label && (
        <label className="input-label" htmlFor={props.id}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className="input textarea"
        rows={rows}
        {...props}
      />
      {error && <span className="input-error-text">{error}</span>}
      {helper && !error && <span className="input-helper">{helper}</span>}
    </div>
  )
})
