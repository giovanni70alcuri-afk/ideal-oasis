import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import './Auth.css'

export function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState({})
  const { login } = useAuth()
  const navigate  = useNavigate()

  const validate = () => {
    const e = {}
    if (!email) e.email = 'Email richiesta'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email non valida'
    if (!password) e.password = 'Password richiesta'
    else if (password.length < 6) e.password = 'Minimo 6 caratteri'
    setErrors(e); return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!validate()) return
    setLoading(true)
    const { success, error } = await login(email, password)
    if (success) { toast.success('Bentornato!'); navigate('/') }
    else toast.error(error || "Errore durante l'accesso")
    setLoading(false)
  }

  return (
    <div className="auth-page animate-fadeIn">
      <div className="auth-card card">
        <div className="auth-logo">∞</div>
        <h1 className="auth-title">Bentornato</h1>
        <p className="auth-sub">Accedi al tuo account OASIS</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className={`input-wrap ${errors.email ? 'input-error':''}`}>
            <label className="input-label">Email</label>
            <input className="input" type="email" placeholder="tua@email.com" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/>
            {errors.email && <span className="input-err-msg">{errors.email}</span>}
          </div>
          <div className={`input-wrap ${errors.password ? 'input-error':''}`}>
            <label className="input-label">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/>
            {errors.password && <span className="input-err-msg">{errors.password}</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
            {loading ? <><span className="spinner spinner-sm btn-spin"/>Accesso…</> : 'Accedi'}
          </button>
        </form>

        <p className="auth-footer-text">
          Non hai un account? <Link to="/signup" className="auth-link">Registrati gratis</Link>
        </p>
      </div>
    </div>
  )
}
