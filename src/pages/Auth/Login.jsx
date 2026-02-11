import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'
import toast from 'react-hot-toast'
import './Auth.css'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}
    if (!email) newErrors.email = 'Email richiesta'
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email non valida'
    if (!password) newErrors.password = 'Password richiesta'
    else if (password.length < 6) newErrors.password = 'Minimo 6 caratteri'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    const { success, error } = await login(email, password)
    
    if (success) {
      toast.success('Benvenuto!')
      navigate('/')
    } else {
      toast.error(error || "Errore durante l'accesso")
    }
    
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <CardBody>
          <div className="auth-header">
            <h1>Accedi</h1>
            <p>Benvenuto su OASIS NO LIMITS</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
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
              placeholder="La tua password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              fullWidth
              autoComplete="current-password"
            />

            <Button type="submit" fullWidth loading={loading} size="lg">
              Accedi
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Non hai un account?{' '}
              <Link to="/signup">Registrati</Link>
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
