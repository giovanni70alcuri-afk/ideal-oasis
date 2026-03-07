import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import { FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiTrash2, FiMoreHorizontal } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import './PostCard.css'

export function PostCard({ post, onDelete, onUpdate }) {
  const { user } = useAuth()
  const [liked, setLiked]       = useState(post?.liked_by_user || false)
  const [likeCount, setLikeCount] = useState(post?.like_count || 0)
  const [saved, setSaved]       = useState(post?.saved_by_user || false)
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading]   = useState(false)

  const profile    = post?.profiles || post?.profile
  const avatarUrl  = profile?.avatar_url
  const authorName = profile?.full_name || profile?.username || 'Utente'
  const isOwner    = user?.id === post?.user_id

  const timeAgo = post?.created_at
    ? formatDistanceToNow(new Date(post.created_at), { locale:it, addSuffix:true })
    : ''

  const handleLike = async () => {
    if (!user) { toast.error('Accedi per mettere like'); return }
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount(p => newLiked ? p+1 : p-1)
    try {
      if (newLiked) {
        await supabase.from('likes').insert({ user_id:user.id, post_id:post.id })
        if (post.user_id !== user.id) {
          await supabase.from('notifications').insert({
            user_id:post.user_id, from_user_id:user.id, type:'like', post_id:post.id
          })
        }
      } else {
        const { data } = await supabase.from('likes').select('id').eq('user_id',user.id).eq('post_id',post.id).single()
        if (data) await supabase.from('likes').delete().eq('id',data.id)
      }
    } catch {
      setLiked(!newLiked); setLikeCount(p => newLiked ? p-1 : p+1)
    }
  }

  const handleSave = async () => {
    if (!user) { toast.error('Accedi per salvare'); return }
    const newSaved = !saved; setSaved(newSaved)
    try {
      if (newSaved) {
        await supabase.from('collections').insert({ user_id:user.id, post_id:post.id })
        toast.success('Salvato nelle raccolte')
      } else {
        const { data } = await supabase.from('collections').select('id').eq('user_id',user.id).eq('post_id',post.id).single()
        if (data) await supabase.from('collections').delete().eq('id',data.id)
        toast('Rimosso dalle raccolte')
      }
    } catch { setSaved(!newSaved) }
  }

  const handleDelete = async () => {
    if (!confirm('Eliminare questo post?')) return
    setLoading(true)
    try {
      await supabase.from('posts').delete().eq('id', post.id)
      toast.success('Post eliminato')
      onDelete?.(post.id)
    } catch { toast.error("Errore nell'eliminazione") }
    finally { setLoading(false); setShowMenu(false) }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`
    if (navigator.share) {
      await navigator.share({ title:'Post su OASIS', url })
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copiato!')
    }
  }

  return (
    <article className="post-card card animate-fadeIn">
      {/* Header */}
      <div className="post-head">
        <Link to={`/profile/${post.user_id}`} className="post-author">
          <div className="avatar avatar-md">
            {avatarUrl ? <img src={avatarUrl} alt="" /> : authorName.slice(0,2).toUpperCase()}
          </div>
          <div>
            <div className="post-author-name">{authorName}</div>
            <div className="post-time">{timeAgo}</div>
          </div>
        </Link>
        <div className="post-menu-wrap">
          <button className="post-more" onClick={() => setShowMenu(p => !p)}>
            <FiMoreHorizontal size={18}/>
          </button>
          {showMenu && (
            <div className="post-menu card" onMouseLeave={() => setShowMenu(false)}>
              <Link to={`/post/${post.id}`} className="post-menu-item">Vedi post</Link>
              <Link to={`/profile/${post.user_id}`} className="post-menu-item">Vedi profilo</Link>
              {isOwner && <button className="post-menu-item danger" onClick={handleDelete} disabled={loading}><FiTrash2 size={14}/> Elimina</button>}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="post-body">
        {post.content && <p className="post-text">{post.content}</p>}
        {post.image_url && (
          <Link to={`/post/${post.id}`} className="post-img-wrap">
            <img src={post.image_url} alt="Post" loading="lazy" className="post-img" />
          </Link>
        )}
      </div>

      {/* Actions */}
      <div className="post-actions">
        <button className={`post-action ${liked ? 'liked':''}`} onClick={handleLike}>
          <FiHeart size={18} fill={liked ? 'currentColor':'none'}/>
          {likeCount > 0 && <span>{likeCount}</span>}
        </button>
        <Link to={`/post/${post.id}`} className="post-action">
          <FiMessageCircle size={18}/>
          {post.comment_count > 0 && <span>{post.comment_count}</span>}
        </Link>
        <button className="post-action" onClick={handleShare}>
          <FiShare2 size={18}/>
        </button>
        <div className="post-action-spacer"/>
        <button className={`post-action ${saved ? 'saved':''}`} onClick={handleSave}>
          <FiBookmark size={18} fill={saved ? 'currentColor':'none'}/>
        </button>
      </div>
    </article>
  )
}
