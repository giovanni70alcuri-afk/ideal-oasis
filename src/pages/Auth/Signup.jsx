import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import './Auth.css'

export function SignupPage() {
  const [fullName, setFullName]             = useState('')
  const [email, setEmail]                   = useState('')
  const [password, setPassword]             = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading]               = useState(false)
  const [errors, setErrors]                 = useState({})
  const { signup } = useAuth()
  const navigate   = useNavigate()

  const validate = () => {
    const e = {}
    if (!fullName.trim()) e.fullName = 'Nome richiesto'
    if (!email) e.email = 'Email richiesta'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email non valida'
    if (!password) e.password = 'Password richiesta'
    else if (password.length < 6) e.password = 'Minimo 6 caratteri'
    if (password !== confirmPassword) e.confirmPassword = 'Le password non coincidono'
    setErrors(e); return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!validate()) return
    setLoading(true)
    const { success, error } = await signup(email, password, fullName)
    if (success) { toast.success('Account creato!'); navigate('/') }
    else toast.error(error || 'Errore durante la registrazione')
    setLoading(false)
  }

  return (
    <div className="auth-page animate-fadeIn">
      <div className="auth-card card">
        <div className="auth-logo">∞</div>
        <h1 className="auth-title">Crea account</h1>
        <p className="auth-sub">Unisciti a OASIS NO LIMITS</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {[
            { label:'Nome completo', type:'text', val:fullName, set:setFullName, key:'fullName', ph:'Il tuo nome', ac:'name' },
            { label:'Email', type:'email', val:email, set:setEmail, key:'email', ph:'tua@email.com', ac:'email' },
            { label:'Password', type:'password', val:password, set:setPassword, key:'password', ph:'Minimo 6 caratteri', ac:'new-password' },
            { label:'Conferma Password', type:'password', val:confirmPassword, set:setConfirmPassword, key:'confirmPassword', ph:'Ripeti la password', ac:'new-password' },
          ].map(f => (
            <div key={f.key} className={`input-wrap ${errors[f.key] ? 'input-error':''}`}>
              <label className="input-label">{f.label}</label>
              <input className="input" type={f.type} placeholder={f.ph} value={f.val} onChange={e=>f.set(e.target.value)} autoComplete={f.ac}/>
              {errors[f.key] && <span className="input-err-msg">{errors[f.key]}</span>}
            </div>
          ))}
          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
            {loading ? <><span className="spinner spinner-sm btn-spin"/>Registrazione…</> : 'Registrati gratis'}
          </button>
        </form>

        <p className="auth-footer-text">
          Hai già un account? <Link to="/login" className="auth-link">Accedi</Link>
        </p>
      </div>
    </div>
  )
}
