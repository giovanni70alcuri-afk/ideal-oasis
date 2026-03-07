import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  FiHome, FiBell, FiUsers, FiShoppingBag, FiBookmark,
  FiMapPin, FiVideo, FiPlusSquare, FiUser, FiLogOut, FiTrendingUp
} from 'react-icons/fi'
import './Sidebar.css'

const NAV_ITEMS = [
  { to:'/',             icon:FiHome,        label:'Home',         exact:true },
  { to:'/reels',        icon:FiVideo,       label:'Reels' },
  { to:'/friends',      icon:FiUsers,       label:'Amici' },
  { to:'/notifications',icon:FiBell,        label:'Notifiche' },
  { to:'/marketplace',  icon:FiShoppingBag, label:'Marketplace' },
  { to:'/collections',  icon:FiBookmark,    label:'Raccolte' },
  { to:'/local',        icon:FiMapPin,      label:'Locale' },
]

export function LeftSidebar() {
  const { user, profile, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const initials = (profile?.full_name || profile?.username || 'U').slice(0,2).toUpperCase()

  return (
    <div className="sidebar-left">
      {/* Profile mini */}
      {isAuthenticated && (
        <div className="sidebar-profile-mini card" onClick={() => navigate(`/profile/${user?.id}`)}>
          <div className="avatar avatar-md">
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : initials}
          </div>
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">{profile?.full_name || profile?.username || 'Utente'}</div>
            <div className="sidebar-profile-handle">@{profile?.username || '…'}</div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to} to={to} end={exact}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="sidebar-nav-icon"><Icon size={20}/></div>
            <span>{label}</span>
          </NavLink>
        ))}
        {isAuthenticated && (
          <NavLink to="/create" className={({ isActive }) => `sidebar-nav-item create ${isActive ? 'active':''}`}>
            <div className="sidebar-nav-icon"><FiPlusSquare size={20}/></div>
            <span>Crea Post</span>
          </NavLink>
        )}
      </nav>

      {/* Ad slot */}
      <div className="sidebar-ad-slot">
        <div className="sidebar-ad-label">Sponsorizzato</div>
        <div className="sidebar-ad-content">
          <div className="sidebar-ad-placeholder">
            <FiTrendingUp size={24}/>
            <span>Il tuo annuncio qui</span>
            <small>Contattaci per la pubblicità</small>
          </div>
        </div>
      </div>

      {/* Logout */}
      {isAuthenticated && (
        <button className="sidebar-logout" onClick={async () => { await logout(); navigate('/login') }}>
          <FiLogOut size={18}/> Esci
        </button>
      )}
    </div>
  )
}
