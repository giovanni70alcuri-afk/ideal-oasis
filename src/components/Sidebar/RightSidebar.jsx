import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { FiTrendingUp, FiUsers } from 'react-icons/fi'
import './Sidebar.css'

export function RightSidebar() {
  const { user, isAuthenticated } = useAuth()
  const [suggested, setSuggested] = useState([])
  const [trending, setTrending] = useState([
    { tag:'#oasisnolimits', count:'12.4K post' },
    { tag:'#italia', count:'8.1K post' },
    { tag:'#reels', count:'5.9K post' },
    { tag:'#fotografia', count:'4.3K post' },
    { tag:'#musica', count:'3.7K post' },
  ])
  const [following, setFollowing] = useState([])

  useEffect(() => {
    const fetchSuggested = async () => {
      let q = supabase.from('profiles').select('id,username,full_name,avatar_url').limit(5)
      if (user) q = q.neq('id', user.id)
      const { data } = await q
      setSuggested(data || [])
    }
    fetchSuggested()
  }, [user])

  useEffect(() => {
    if (!user) return
    const fetchFollowing = async () => {
      const { data } = await supabase.from('follows').select('following_id').eq('follower_id', user.id)
      setFollowing(data?.map(f => f.following_id) || [])
    }
    fetchFollowing()
  }, [user])

  const handleFollow = async (targetId) => {
    if (!user) return
    if (following.includes(targetId)) {
      const { data } = await supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', targetId).single()
      if (data) await supabase.from('follows').delete().eq('id', data.id)
      setFollowing(p => p.filter(id => id !== targetId))
    } else {
      await supabase.from('follows').insert({ follower_id:user.id, following_id:targetId })
      setFollowing(p => [...p, targetId])
    }
  }

  return (
    <div className="sidebar-right">
      {/* Suggested People */}
      {suggested.length > 0 && (
        <div className="sidebar-widget card">
          <div className="sidebar-widget-title"><FiUsers size={15}/> Persone che potresti conoscere</div>
          {suggested.map(u => {
            const initials = (u.full_name || u.username || 'U').slice(0,2).toUpperCase()
            const isF = following.includes(u.id)
            return (
              <div key={u.id} className="sidebar-user-row">
                <Link to={`/profile/${u.id}`} className="sidebar-user-info">
                  <div className="avatar avatar-sm">
                    {u.avatar_url ? <img src={u.avatar_url} alt="" /> : initials}
                  </div>
                  <div>
                    <div className="sidebar-user-name">{u.full_name || u.username}</div>
                    <div className="sidebar-user-handle">@{u.username}</div>
                  </div>
                </Link>
                {isAuthenticated && (
                  <button className={`btn btn-sm ${isF ? 'btn-glass':'btn-outline'}`} onClick={() => handleFollow(u.id)}>
                    {isF ? 'Seguito' : 'Segui'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Trending */}
      <div className="sidebar-widget card">
        <div className="sidebar-widget-title"><FiTrendingUp size={15}/> Trend per te</div>
        {trending.map(t => (
          <div key={t.tag} className="sidebar-trend-row">
            <div className="sidebar-trend-tag">{t.tag}</div>
            <div className="sidebar-trend-count">{t.count}</div>
          </div>
        ))}
      </div>

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

      <div className="sidebar-footer">
        <span>© 2025 OASIS NO LIMITS</span>
        <span>·</span>
        <span>Privacy</span>
        <span>·</span>
        <span>Termini</span>
      </div>
    </div>
  )
}
