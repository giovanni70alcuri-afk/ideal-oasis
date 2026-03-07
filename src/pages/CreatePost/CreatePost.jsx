import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { FiImage, FiX, FiVideo } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './CreatePost.css'

export function CreatePostPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [image, setImage]     = useState(null)
  const [preview, setPreview] = useState(null)
  const [type, setType]       = useState('post')
  const [loading, setLoading] = useState(false)

  const handleImage = (e) => {
    const f = e.target.files[0]; if (!f) return
    if (!f.type.startsWith('image/')) { toast.error('Solo immagini'); return }
    if (f.size > 8 * 1024 * 1024)    { toast.error('Max 8MB'); return }
    setImage(f); setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() && !image) { toast.error('Scrivi qualcosa o aggiungi un\'immagine'); return }
    setLoading(true)
    try {
      let image_url = null
      if (image) {
        const ext  = image.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error:upErr } = await supabase.storage.from('post-images').upload(path, image)
        if (upErr) throw upErr
        const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(path)
        image_url = publicUrl
      }
      const { error } = await supabase.from('posts').insert({
        user_id:user.id, content:content.trim(), image_url, type
      })
      if (error) throw error
      toast.success('Post pubblicato! 🎉')
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Errore nella pubblicazione')
    } finally { setLoading(false) }
  }

  const initials = (profile?.full_name || profile?.username || 'U').slice(0,2).toUpperCase()

  return (
    <div className="create-page animate-fadeIn">
      <div className="create-card card">
        <div className="create-header">
          <h1>Crea un post</h1>
          <div className="create-type-tabs">
            {['post','reel'].map(t => (
              <button key={t} className={`create-type-tab ${type===t?'active':''}`} onClick={() => setType(t)}>
                {t === 'post' ? <><FiImage size={14}/> Post</> : <><FiVideo size={14}/> Reel</>}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="create-form">
          <div className="create-top">
            <div className="avatar avatar-md">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt=""/> : initials}
            </div>
            <textarea
              className="create-textarea"
              placeholder="Cosa stai pensando?"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
              maxLength={2000}
            />
          </div>

          {preview && (
            <div className="create-preview">
              <img src={preview} alt="Preview"/>
              <button type="button" className="create-remove-img" onClick={() => { setImage(null); setPreview(null) }}>
                <FiX size={18}/>
              </button>
            </div>
          )}

          <div className="create-actions">
            <label className="create-media-btn">
              <FiImage size={18}/> Foto
              <input type="file" accept="image/*" onChange={handleImage} hidden/>
            </label>
            <div className="create-char">{content.length}/2000</div>
            <button type="submit" className="btn btn-primary btn-md" disabled={loading || (!content.trim() && !image)}>
              {loading ? <><span className="spinner spinner-sm btn-spin"/>Pubblicazione…</> : 'Pubblica'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
