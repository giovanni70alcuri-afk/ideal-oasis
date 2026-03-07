import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { FiBookmark, FiHeart, FiMessageCircle } from 'react-icons/fi'
import './Collections.css'

export function CollectionsPage() {
  const { user } = useAuth()
  const [saved, setSaved] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('collections')
        .select('post_id, posts(*, profiles(id,username,full_name,avatar_url), likes(count), comments(count))')
        .eq('user_id', user.id).order('created_at',{ascending:false})
      setSaved(data?.map(d=>d.posts).filter(Boolean)||[])
      setLoading(false)
    }
    if (user) fetch()
  }, [user])

  return (
    <div className="collections-page animate-fadeIn">
      <div className="collections-header">
        <h1><FiBookmark size={22}/> Raccolte</h1>
        <p>Post che hai salvato</p>
      </div>
      {loading ? <div className="page-loader"><div className="spinner"/></div> : (
        <div className="collections-grid">
          {saved.map(p => {
            const pf = p.profiles
            const init = (pf?.full_name||pf?.username||'U').slice(0,2).toUpperCase()
            return (
              <Link to={`/post/${p.id}`} key={p.id} className="collection-item card">
                {p.image_url
                  ? <div className="collection-img"><img src={p.image_url} alt="" loading="lazy"/></div>
                  : <div className="collection-text-preview">{p.content?.slice(0,120)}</div>
                }
                <div className="collection-footer">
                  <div className="avatar avatar-xs">{pf?.avatar_url?<img src={pf.avatar_url} alt=""/>:init}</div>
                  <span className="collection-author">{pf?.full_name||pf?.username}</span>
                  <div className="collection-stats">
                    <span><FiHeart size={12}/> {p.likes?.[0]?.count||0}</span>
                    <span><FiMessageCircle size={12}/> {p.comments?.[0]?.count||0}</span>
                  </div>
                </div>
              </Link>
            )
          })}
          {saved.length===0 && (
            <div className="collections-empty">
              <FiBookmark size={40}/><p>Nessun post salvato ancora.</p>
              <small>Premi il segnalibro su un post per salvarlo qui.</small>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
