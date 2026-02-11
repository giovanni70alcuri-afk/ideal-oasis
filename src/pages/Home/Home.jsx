import { Link } from 'react-router-dom'
import { Feed } from '../../components/Feed/Feed'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import './Home.css'

export function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="home-logo">
          <img src="/logo-large.svg" alt="OASIS NO LIMITS Logo" className="logo-image" />
        </div>
        
        <h1 className="home-title">
          OASIS <span className="home-subtitle">NO LIMITS</span>
        </h1>
        <p className="home-description">
          Il social network dove le connessioni non hanno limiti.
          Condividi, connettiti, scopri.
        </p>
        
        {isAuthenticated ? (
          <Feed />
        ) : (
          <div className="home-cta">
            <Link to="/signup">
              <Button size="lg">Inizia ora - gratuito</Button>
            </Link>
            <p className="home-login-link">
              Hai già un account? <Link to="/login">Accedi</Link>
            </p>
          </div>
        )}
      </div>

      <section className="home-features">
        <div className="home-feature">
          <div className="feature-icon">📝</div>
          <h3>Condividi Post</h3>
          <p>Scrivi e condividi i tuoi pensieri con il mondo.</p>
        </div>
        
        <div className="home-feature">
          <div className="feature-icon">👥</div>
          <h3>Segui Persone</h3>
          <p>Connettiti con chi ti interessa.</p>
        </div>
        
        <div className="home-feature">
          <div className="feature-icon">💬</div>
          <h3>Commenta</h3>
          <p>Interagisci e fatti sentire.</p>
        </div>
        
        <div className="home-feature">
          <div className="feature-icon">❤️</div>
          <h3>Like</h3>
          <p>Metti like ai post che ami.</p>
        </div>
      </section>
    </div>
  )
}
