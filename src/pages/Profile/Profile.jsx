import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Feed } from '../../components/Feed/Feed'
import { FiUserPlus, FiUserMinus, FiMapPin, FiCalendar, FiEdit2, FiLink } from 'react-icons/fi'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import toast from 'react-hot-toast'
import './Profile.css'

export function ProfilePage() {
  const { userId } = useParams()
  const { user: me, profile: myProfile, updateProfile } = useAuth()
  const [profile, setProfile]           = useState(null)
  const [loading, setLoading]           = useState(true)
  const [isFollowing, setIsFollowing]   = useState(false)
  const [followers, setFollowers]       = useState(0)
  const [following, setFollowing]       = useState(0)
  const [postCount, setPostCount]       = useState(0)
  const [editMode, setEditMode]         = useState(false)
  const [editData, setEditData]         = useState({})
  const [saving, setSaving]             = useState(false)

  const isOwn = me?.id === userId

  useEffect(() => {
    fetchAll()
  }, [userId])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [profRes, followersRes, followingRes, postsRes, isFollowingRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('follows').select('id', { count:'exact', head:true }).eq('following_id', userId),
        supabase.from('follows').select('id', { count:'exact', head:true }).eq('follower_id', userId),
        supabase.from('posts').select('id', { count:'exact', head:true }).eq('user_id', userId),
        me ? supabase.from('follows').select('id').eq('follower_id', me.id).eq('following_id', userId).maybeSingle() : Promise.resolve({ data:null }),
      ])
      if (profRes.data) { setProfile(profRes.data); setEditData(profRes.data) }
      setFollowers(followersRes.count || 0)
      setFollowing(followingRes.count || 0)
      setPostCount(postsRes.count || 0)
      setIsFollowing(!!isFollowingRes.data)
    } catch (e) { toast.error('Errore nel caricamento del profilo') }
    finally { setLoading(false) }
  }

  const handleFollow = async () => {
    if (!me) { toast.error('Accedi per seguire'); return }
    try {
      if (isFollowing) {
        const { data } = await supabase.from('follows').select('id').eq('follower_id',me.id).eq('following_id',userId).single()
        if (data) await supabase.from('follows').delete().eq('id',data.id)
        setIsFollowing(false); setFollowers(p=>p-1)
        toast('Non segui più questo utente')
      } else {
        await supabase.from('follows').insert({ follower_id:me.id, following_id:userId })
        await supabase.from('notifications').insert({ user_id:userId, from_user_id:me.id, type:'follow' })
        setIsFollowing(true); setFollowers(p=>p+1)
        toast.success('Ora segui questo utente')
      }
    } catch { toast.error('Errore') }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    const { success, error } = await updateProfile({
      full_name: editData.full_name,
      username:  editData.username,
      bio:       editData.bio,
      location:  editData.location,
      website:   editData.website,
    })
    if (success) { toast.success('Profilo aggiornato'); setEditMode(false); fetchAll() }
    else toast.error(error || 'Errore')
    setSaving(false)
  }

  if (loading) return <div className="page-loader"><div className="spinner"/></div>
  if (!profile) return <div className="page-loader"><p>Profilo non trovato</p></div>

  const avatarUrl = profile.avatar_url
  const initials  = (profile.full_name || profile.username || 'U').slice(0,2).toUpperCase()

  return (
    <div className="profile-page animate-fadeIn">
      {/* Header card */}
      <div className="profile-header card">
        <div className="profile-cover">
          {profile.cover_url
            ? <img src={profile.cover_url} alt="Cover" className="profile-cover-img"/>
            : <div className="profile-cover-placeholder"/>}
        </div>
        <div className="profile-header-body">
          <div className="profile-avatar-wrap">
            <div className="avatar avatar-xxl profile-avatar">
              {avatarUrl ? <img src={avatarUrl} alt=""/> : initials}
            </div>
          </div>
          <div className="profile-header-actions">
            {isOwn ? (
              <button className="btn btn-glass btn-sm" onClick={() => setEditMode(p=>!p)}>
                <FiEdit2 size={14}/> {editMode ? 'Annulla' : 'Modifica profilo'}
              </button>
            ) : (
              <button className={`btn btn-sm ${isFollowing ? 'btn-glass':'btn-primary'}`} onClick={handleFollow}>
                {isFollowing ? <><FiUserMinus size={14}/> Non seguire</> : <><FiUserPlus size={14}/> Segui</>}
              </button>
            )}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{profile.full_name || profile.username}</h1>
            <p className="profile-handle">@{profile.username}</p>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            <div className="profile-meta">
              {profile.location && <span className="profile-meta-item"><FiMapPin size={13}/>{profile.location}</span>}
              {profile.website  && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="profile-meta-item link"><FiLink size={13}/>{profile.website}</a>}
              <span className="profile-meta-item"><FiCalendar size={13}/>Membro da {format(new Date(profile.created_at), 'MMM yyyy', { locale:it })}</span>
            </div>
            <div className="profile-stats">
              <div className="profile-stat"><span className="stat-val">{postCount}</span><span className="stat-lbl">Post</span></div>
              <div className="profile-stat"><span className="stat-val">{followers}</span><span className="stat-lbl">Follower</span></div>
              <div className="profile-stat"><span className="stat-val">{following}</span><span className="stat-lbl">Seguiti</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      {editMode && isOwn && (
        <div className="profile-edit card animate-slideUp">
          <h3 className="profile-edit-title">Modifica profilo</h3>
          <div className="profile-edit-grid">
            {[
              { label:'Nome', key:'full_name', ph:'Il tuo nome' },
              { label:'Username', key:'username', ph:'@username' },
              { label:'Bio', key:'bio', ph:'Parlaci di te…', area:true },
              { label:'Posizione', key:'location', ph:'Città, Paese' },
              { label:'Sito web', key:'website', ph:'https://…' },
            ].map(f => (
              <div key={f.key} className={`input-wrap ${f.area ? 'full':''}`}>
                <label className="input-label">{f.label}</label>
                {f.area
                  ? <textarea className="input" rows={3} placeholder={f.ph} value={editData[f.key]||''} onChange={e=>setEditData(p=>({...p,[f.key]:e.target.value}))}/>
                  : <input className="input" placeholder={f.ph} value={editData[f.key]||''} onChange={e=>setEditData(p=>({...p,[f.key]:e.target.value}))}/>
                }
              </div>
            ))}
          </div>
          <div className="profile-edit-actions">
            <button className="btn btn-primary btn-md" onClick={handleSaveProfile} disabled={saving}>
              {saving ? <><span className="spinner spinner-sm btn-spin"/>Salvo…</> : 'Salva modifiche'}
            </button>
          </div>
        </div>
      )}

      {/* Posts */}
      <h2 className="profile-posts-title">Post</h2>
      <Feed userId={userId} />
    </div>
  )
}
