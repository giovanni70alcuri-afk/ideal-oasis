import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'
import toast from 'react-hot-toast'
import './Auth.css'

export function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  const { signup } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}
    if (!fullName.trim()) newErrors.fullName = 'Nome richiesto'
    if (!email) newErrors.email = 'Email richiesta'
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email non valida'
    if (!password) newErrors.password = 'Password richiesta'
    else if (password.length < 6) newErrors.password = 'Minimo 6 caratteri'
    if (password !== confirmPassword) newErrors.confirmPassword = 'Le password non coincidono'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    const { success, error } = await signup(email, password, fullName)
    
    if (success) {
      toast.success('Account creato! Verifica la tua email.')
      navigate('/')
    } else {
      toast.error(error || 'Errore durante la registrazione')
    }
    
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <CardBody>
          <div className="auth-header">
            <h1>Registrati</h1>
            <p>Crea il tuo account su OASIS NO LIMITS</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Nome completo"
              type="text"
              placeholder="Il tuo nome"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={errors.fullName}
              fullWidth
              autoComplete="name"
            />

            <Input
              label="Email"
              type="email"
              placeholder="tua@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              fullWidth
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="Minimo 6 caratteri"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              fullWidth
              autoComplete="new-password"
            />

            <Input
              label="Conferma Password"
              type="password"
              placeholder="Ripeti la password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              fullWidth
              autoComplete="new-password"
            />

            <Button type="submit" fullWidth loading={loading} size="lg">
              Registrati
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Hai già un account?{' '}
              <Link to="/login">Accedi</Link>
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
