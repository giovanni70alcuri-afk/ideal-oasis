import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { FiUserPlus, FiUserMinus, FiUsers } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './Friends.css'

export function FriendsPage() {
  const { user } = useAuth()
  const [tab, setTab]               = useState('suggestions')
  const [suggestions, setSuggestions] = useState([])
  const [followers, setFollowers]   = useState([])
  const [following, setFollowing]   = useState([])
  const [myFollowing, setMyFollowing] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => { fetchAll() }, [user])

  const fetchAll = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [sugg, fersRes, fingRes, myFingRes] = await Promise.all([
        supabase.from('profiles').select('id,username,full_name,avatar_url').neq('id', user.id).limit(20),
        supabase.from('follows').select('follower_id, profiles!follower_id(id,username,full_name,avatar_url)').eq('following_id', user.id),
        supabase.from('follows').select('following_id, profiles!following_id(id,username,full_name,avatar_url)').eq('follower_id', user.id),
        supabase.from('follows').select('following_id').eq('follower_id', user.id),
      ])
      setSuggestions(sugg.data || [])
      setFollowers(fersRes.data?.map(f => f.profiles).filter(Boolean) || [])
      setFollowing(fingRes.data?.map(f => f.profiles).filter(Boolean) || [])
      setMyFollowing(myFingRes.data?.map(f => f.following_id) || [])
    } finally { setLoading(false) }
  }

  const handleFollow = async (targetId) => {
    if (!user) return
    if (myFollowing.includes(targetId)) {
      const { data } = await supabase.from('follows').select('id').eq('follower_id',user.id).eq('following_id',targetId).single()
      if (data) await supabase.from('follows').delete().eq('id',data.id)
      setMyFollowing(p => p.filter(id => id!==targetId))
      toast('Non segui più questo utente')
    } else {
      await supabase.from('follows').insert({ follower_id:user.id, following_id:targetId })
      await supabase.from('notifications').insert({ user_id:targetId, from_user_id:user.id, type:'follow' })
      setMyFollowing(p => [...p, targetId])
      toast.success('Ora segui questo utente')
    }
  }

  const UserCard = ({ u }) => {
    const init = (u?.full_name||u?.username||'U').slice(0,2).toUpperCase()
    const isF  = myFollowing.includes(u.id)
    return (
      <div className="friend-card card">
        <Link to={`/profile/${u.id}`} className="friend-av">
          <div className="avatar avatar-lg">{u.avatar_url ? <img src={u.avatar_url} alt=""/> : init}</div>
        </Link>
        <Link to={`/profile/${u.id}`} className="friend-name">{u.full_name||u.username}</Link>
        <span className="friend-handle">@{u.username}</span>
        <button className={`btn btn-sm ${isF?'btn-glass':'btn-primary'}`} onClick={() => handleFollow(u.id)}>
          {isF ? <><FiUserMinus size={13}/> Seguito</> : <><FiUserPlus size={13}/> Segui</>}
        </button>
      </div>
    )
  }

  const TABS = [
    { key:'suggestions', label:'Suggeriti',  data:suggestions },
    { key:'followers',   label:'Follower',   data:followers },
    { key:'following',   label:'Seguiti',    data:following },
  ]

  const currentData = TABS.find(t=>t.key===tab)?.data || []

  return (
    <div className="friends-page animate-fadeIn">
      <div className="friends-header">
        <h1><FiUsers size={22}/> Amici</h1>
        <div className="friends-tabs">
          {TABS.map(t => (
            <button key={t.key} className={`friends-tab ${tab===t.key?'active':''}`} onClick={() => setTab(t.key)}>
              {t.label} <span className="friends-tab-count">{t.data.length}</span>
            </button>
          ))}
        </div>
      </div>
      {loading ? <div className="page-loader"><div className="spinner"/></div> : (
        <div className="friends-grid">
          {currentData.map(u => u && <UserCard key={u.id} u={u}/>)}
          {currentData.length === 0 && <p className="friends-empty">Nessuno qui ancora.</p>}
        </div>
      )}
    </div>
  )
}
