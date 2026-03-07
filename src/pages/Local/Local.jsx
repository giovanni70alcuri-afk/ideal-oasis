import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FiMapPin, FiSearch } from 'react-icons/fi'
import './Local.css'

export function LocalPage() {
  const [city, setCity]   = useState('')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const search = async () => {
    if (!city.trim()) return
    setLoading(true); setSearched(true)
    const { data } = await supabase.from('profiles')
      .select('id').ilike('location', `%${city.trim()}%`)
    const ids = data?.map(p=>p.id)||[]
    if (ids.length) {
      const { data:localPosts } = await supabase.from('posts')
        .select('*, profiles(id,username,full_name,avatar_url,location), likes(count)')
        .in('user_id',ids).order('created_at',{ascending:false}).limit(30)
      setPosts(localPosts||[])
    } else { setPosts([]) }
    setLoading(false)
  }

  return (
    <div className="local-page animate-fadeIn">
      <div className="local-header">
        <h1><FiMapPin size={22}/> Locale</h1>
        <p>Scopri cosa succede nella tua zona</p>
      </div>
      <div className="local-search card">
        <div className="local-search-inner">
          <FiMapPin size={18} className="local-search-icon"/>
          <input
            className="local-input"
            placeholder="Inserisci città o zona…"
            value={city}
            onChange={e=>setCity(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&search()}
          />
          <button className="btn btn-primary btn-sm" onClick={search}>
            <FiSearch size={15}/> Cerca
          </button>
        </div>
      </div>

      {loading && <div className="page-loader"><div className="spinner"/></div>}

      {!loading && searched && posts.length===0 && (
        <div className="local-empty card">
          <FiMapPin size={40}/><p>Nessun contenuto trovato per "{city}"</p>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="local-results">
          <p className="local-results-label">{posts.length} post da <strong>{city}</strong></p>
          <div className="local-grid">
            {posts.map(p => {
              const pf = p.profiles
              return (
                <div key={p.id} className="local-post card">
                  <div className="local-post-head">
                    <div className="avatar avatar-sm">{pf?.avatar_url?<img src={pf.avatar_url} alt=""/>:(pf?.full_name||'U').slice(0,2).toUpperCase()}</div>
                    <div>
                      <div className="local-post-name">{pf?.full_name||pf?.username}</div>
                      <div className="local-post-loc"><FiMapPin size={11}/>{pf?.location}</div>
                    </div>
                  </div>
                  {p.image_url && <img src={p.image_url} alt="" className="local-post-img" loading="lazy"/>}
                  {p.content && <p className="local-post-text">{p.content.slice(0,200)}</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!searched && (
        <div className="local-intro">
          {['Roma','Milano','Napoli','Torino','Palermo'].map(c => (
            <button key={c} className="local-city-chip" onClick={() => { setCity(c); }}>
              <FiMapPin size={13}/>{c}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
