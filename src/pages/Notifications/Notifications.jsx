import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import { FiHeart, FiUserPlus, FiMessageCircle, FiBell } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './Notifications.css'

const ICONS = {
  like:    { Icon:FiHeart,          color:'var(--danger)',  label:'like' },
  follow:  { Icon:FiUserPlus,       color:'var(--accent)',  label:'follow' },
  comment: { Icon:FiMessageCircle,  color:'var(--success)', label:'commento' },
}

export function NotificationsPage() {
  const { user } = useAuth()
  const [notifs, setNotifs]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchNotifs()
    const sub = supabase.channel('notifs-realtime')
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'notifications', filter:`user_id=eq.${user.id}` },
        payload => { setNotifs(p => [payload.new, ...p]); toast('🔔 Nuova notifica') })
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [user])

  const fetchNotifs = async () => {
    try {
      const { data } = await supabase.from('notifications')
        .select('*, profiles:from_user_id(id,username,full_name,avatar_url)')
        .eq('user_id', user.id).order('created_at', { ascending:false }).limit(60)
      setNotifs(data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const markRead = async (id) => {
    await supabase.from('notifications').update({ read:true }).eq('id', id)
    setNotifs(p => p.map(n => n.id===id ? {...n,read:true} : n))
  }

  const markAllRead = async () => {
    const ids = notifs.filter(n=>!n.read).map(n=>n.id)
    if (!ids.length) return
    await supabase.from('notifications').update({ read:true }).in('id', ids)
    setNotifs(p => p.map(n => ({...n,read:true})))
    toast.success('Tutte segnate come lette')
  }

  const deleteNotif = async (id) => {
    await supabase.from('notifications').delete().eq('id', id)
    setNotifs(p => p.filter(n => n.id!==id))
  }

  const unread = notifs.filter(n=>!n.read).length

  if (loading) return <div className="page-loader"><div className="spinner"/></div>

  return (
    <div className="notifs-page animate-fadeIn">
      <div className="notifs-header">
        <h1>Notifiche {unread > 0 && <span className="badge">{unread}</span>}</h1>
        {unread > 0 && <button className="btn btn-glass btn-sm" onClick={markAllRead}>Segna tutte lette</button>}
      </div>

      {notifs.length === 0 ? (
        <div className="card notifs-empty">
          <FiBell size={40}/><h3>Nessuna notifica</h3>
          <p>Quando qualcuno interagisce con te, lo vedrai qui.</p>
        </div>
      ) : (
        <div className="notifs-list">
          {notifs.map(n => {
            const meta = ICONS[n.type] || ICONS.comment
            const from = n.profiles
            const init = (from?.full_name||from?.username||'U').slice(0,2).toUpperCase()
            return (
              <div key={n.id} className={`notif-item card ${!n.read?'unread':''}`}>
                <Link
                  to={n.post_id ? `/post/${n.post_id}` : `/profile/${n.from_user_id}`}
                  className="notif-link"
                  onClick={() => !n.read && markRead(n.id)}
                >
                  <div className="notif-av-wrap">
                    <div className="avatar avatar-md">
                      {from?.avatar_url ? <img src={from.avatar_url} alt=""/> : init}
                    </div>
                    <div className="notif-type-icon" style={{ background: meta.color + '22', color: meta.color }}>
                      <meta.Icon size={10}/>
                    </div>
                  </div>
                  <div className="notif-content">
                    <p className="notif-text">
                      <strong>{from?.full_name||from?.username}</strong>{' '}
                      {n.type==='like'    && 'ha messo like al tuo post'}
                      {n.type==='follow'  && 'ha iniziato a seguirti'}
                      {n.type==='comment' && 'ha commentato il tuo post'}
                      {!ICONS[n.type] && (n.message||'nuova notifica')}
                    </p>
                    <span className="notif-time">{formatDistanceToNow(new Date(n.created_at),{locale:it,addSuffix:true})}</span>
                  </div>
                  {!n.read && <div className="notif-dot"/>}
                </Link>
                <button className="notif-del" onClick={() => deleteNotif(n.id)}>×</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
