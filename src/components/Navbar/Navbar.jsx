import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import {
  FiSearch, FiBell, FiMessageSquare, FiPlusSquare, FiLogOut, FiUser
} from 'react-icons/fi'
import './Navbar.css'

export function Navbar() {
  const { user, profile, logout, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [unread, setUnread] = useState(0)
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('notifications').select('id', { count:'exact', head:true })
        .eq('user_id', user.id).eq('read', false)
      setUnread(count || 0)
    }
    fetchUnread()
    const sub = supabase.channel('notif-count')
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'notifications', filter:`user_id=eq.${user.id}` }, () => setUnread(p => p+1))
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [user])

  useEffect(() => {
    if (!searchQ.trim()) { setSearchResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      const { data } = await supabase.from('profiles')
        .select('id,username,full_name,avatar_url')
        .or(`username.ilike.%${searchQ}%,full_name.ilike.%${searchQ}%`)
        .limit(6)
      setSearchResults(data || [])
      setSearching(false)
    }, 300)
    return () => clearTimeout(t)
  }, [searchQ])

  const handleLogout = async () => { await logout(); navigate('/login') }
  const initials = (profile?.full_name || profile?.username || 'U').slice(0,2).toUpperCase()
  const avatarUrl = profile?.avatar_url

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="nav-logo-icon">∞</div>
          <div>
            <span className="nav-logo-name">OASIS</span>
            <span className="nav-logo-sub">NO LIMITS</span>
          </div>
        </Link>

        {/* Search */}
        <div className={`nav-search-wrap ${showSearch ? 'open':''}`}>
          <div className="nav-search">
            <FiSearch size={16} className="nav-search-icon" />
            <input
              className="nav-search-input"
              placeholder="Cerca persone, post…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              onFocus={() => setShowSearch(true)}
              onBlur={() => setTimeout(()=>setShowSearch(false),200)}
            />
          </div>
          {showSearch && searchResults.length > 0 && (
            <div className="nav-search-dropdown">
              {searchResults.map(u => (
                <Link key={u.id} to={`/profile/${u.id}`} className="nav-search-item" onClick={() => { setSearchQ(''); setShowSearch(false) }}>
                  <div className="avatar avatar-sm">
                    {u.avatar_url ? <img src={u.avatar_url} alt="" /> : (u.full_name||u.username||'U').slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div className="nav-search-name">{u.full_name || u.username}</div>
                    <div className="nav-search-handle">@{u.username}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <Link to="/create" className="btn btn-primary btn-sm nav-create-btn">
                <FiPlusSquare size={16}/> Crea
              </Link>
              <Link to="/notifications" className="nav-icon-btn" title="Notifiche">
                <FiBell size={20}/>
                {unread > 0 && <span className="badge nav-badge">{unread > 9 ? '9+' : unread}</span>}
              </Link>
              <Link to={`/profile/${user?.id}`} className="nav-avatar" title="Profilo">
                <div className="avatar avatar-sm">
                  {avatarUrl ? <img src={avatarUrl} alt="" /> : initials}
                </div>
              </Link>
              <button className="nav-icon-btn" onClick={handleLogout} title="Esci">
                <FiLogOut size={18}/>
              </button>
            </>
          ) : (
            <>
              <Link to="/login"><button className="btn btn-glass btn-sm">Accedi</button></Link>
              <Link to="/signup"><button className="btn btn-primary btn-sm">Registrati</button></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
