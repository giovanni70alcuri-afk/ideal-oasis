import { Link } from 'react-router-dom'
import { Feed } from '../../components/Feed/Feed'
import { useAuth } from '../../context/AuthContext'
import { FiZap } from 'react-icons/fi'
import './Home.css'

export function HomePage() {
  const { isAuthenticated, profile } = useAuth()

  return (
    <div className="home-page animate-fadeIn">
      {isAuthenticated ? (
        <>
          <div className="home-greeting">
            <span>Ciao, <strong>{profile?.full_name || profile?.username || 'amico'}</strong> 👋</span>
            <Link to="/create" className="btn btn-primary btn-sm">
              <FiZap size={15}/> Crea Post
            </Link>
          </div>
          <Feed />
        </>
      ) : (
        <div className="home-hero">
          <div className="home-hero-badge">🌊 Social network senza confini</div>
          <h1 className="home-hero-title">
            Benvenuto su<br/>
            <span className="home-hero-brand">OASIS</span>
            <span className="home-hero-brand2"> NO LIMITS</span>
          </h1>
          <p className="home-hero-desc">
            Connettiti con le persone, condividi i tuoi momenti,<br/>
            scopri contenuti che ti ispirano. Tutto senza limiti.
          </p>
          <div className="home-hero-cta">
            <Link to="/signup" className="btn btn-primary btn-xl">Inizia gratis</Link>
            <Link to="/login"  className="btn btn-glass btn-xl">Accedi</Link>
          </div>
          <div className="home-features">
            {[
              { icon:'📝', title:'Post & Reels', desc:'Condividi testo, foto e video' },
              { icon:'👥', title:'Amici & Follow', desc:'Connettiti con chi ami' },
              { icon:'❤️', title:'Like & Commenti', desc:'Interagisci con i contenuti' },
              { icon:'🛍️', title:'Marketplace', desc:'Vendi e compra nella community' },
              { icon:'🔔', title:'Notifiche', desc:'Resta sempre aggiornato' },
              { icon:'📍', title:'Locale', desc:'Scopri eventi vicino a te' },
            ].map(f => (
              <div key={f.title} className="home-feature card">
                <div className="home-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
