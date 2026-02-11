import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'
import { Avatar } from '../ui/Avatar'
import { FiHome, FiBell, FiUser, FiLogOut, FiPlusSquare } from 'react-icons/fi'
import './Navbar.css'

export function Navbar() {
  const { user, profile, logout, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <nav className="navbar navbar-loading">
        <div className="navbar-container">
          <div className="navbar-brand">
            <Link to="/">OASIS</Link>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          OASIS
          <span className="navbar-brand-subtitle">NO LIMITS</span>
        </Link>

        {isAuthenticated ? (
          <div className="navbar-authenticated">
            <Link to="/" className="navbar-icon" title="Home">
              <FiHome size={24} />
            </Link>
            <Link to="/create" className="navbar-icon" title="Crea post">
              <FiPlusSquare size={24} />
            </Link>
            <Link to="/notifications" className="navbar-icon" title="Notifiche">
              <FiBell size={24} />
              <span className="navbar-badge">0</span>
            </Link>
            <Link to={`/profile/${user?.id}`} className="navbar-profile">
              <Avatar
                src={profile?.avatar || user?.avatar}
                alt={profile?.name || profile?.username || user?.name || 'User'}
                size="sm"
              />
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <FiLogOut size={18} />
            </Button>
          </div>
        ) : (
          <div className="navbar-guest">
            <Link to="/login">
              <Button variant="ghost" size="sm">Accedi</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Registrati</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
