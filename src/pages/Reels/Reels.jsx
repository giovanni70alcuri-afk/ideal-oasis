import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { FiVideo, FiHeart, FiMessageCircle } from 'react-icons/fi'
import './Reels.css'

export function ReelsPage() {
  const [reels, setReels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('posts')
        .select('*, profiles(id,username,full_name,avatar_url), likes(count), comments(count)')
        .eq('type','reel').order('created_at',{ascending:false}).limit(30)
      setReels(data||[]); setLoading(false)
    }
    fetch()
  }, [])

  return (
    <div className="reels-page animate-fadeIn">
      <div className="reels-header">
        <h1><FiVideo size={22}/> Reels</h1>
        <p>Guarda i video della community</p>
      </div>
      {loading ? <div className="page-loader"><div className="spinner"/></div> : (
        <div className="reels-grid">
          {reels.map(r => {
            const pf = r.profiles
            const init = (pf?.full_name||pf?.username||'U').slice(0,2).toUpperCase()
            return (
              <Link to={`/post/${r.id}`} key={r.id} className="reel-card card">
                <div className="reel-thumb">
                  {r.image_url
                    ? <img src={r.image_url} alt="" loading="lazy"/>
                    : <div className="reel-placeholder"><FiVideo size={32}/></div>
                  }
                  <div className="reel-overlay">
                    <div className="reel-stats">
                      <span><FiHeart size={13}/> {r.likes?.[0]?.count||0}</span>
                      <span><FiMessageCircle size={13}/> {r.comments?.[0]?.count||0}</span>
                    </div>
                  </div>
                </div>
                <div className="reel-info">
                  <div className="avatar avatar-xs">{pf?.avatar_url?<img src={pf.avatar_url} alt=""/>:init}</div>
                  <div className="reel-author">{pf?.full_name||pf?.username}</div>
                </div>
              </Link>
            )
          })}
          {reels.length === 0 && (
            <div className="reels-empty">
              <FiVideo size={40}/><p>Nessun reel ancora.</p>
              <small>Crea il primo reel!</small>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
