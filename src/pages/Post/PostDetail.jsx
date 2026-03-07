import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import { FiArrowLeft, FiHeart, FiShare2, FiSend, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './PostDetail.css'

export function PostDetailPage() {
  const { postId } = useParams()
  const { user, profile } = useAuth()
  const [post, setPost]         = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading]   = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [liked, setLiked]       = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  useEffect(() => { fetchPost(); fetchComments() }, [postId])

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts').select('*, profiles(*), likes(count)').eq('id', postId).single()
      if (error) throw error
      setPost(data); setLikeCount(data.likes?.[0]?.count || 0)
      if (user) {
        const { data: ul } = await supabase.from('likes').select('id').eq('user_id',user.id).eq('post_id',postId).maybeSingle()
        setLiked(!!ul)
      }
    } catch { toast.error('Post non trovato') }
    finally { setLoading(false) }
  }

  const fetchComments = async () => {
    const { data } = await supabase.from('comments')
      .select('*, profiles(*)').eq('post_id', postId).order('created_at', { ascending:true })
    setComments(data || [])
  }

  const handleLike = async () => {
    if (!user) { toast.error('Accedi per mettere like'); return }
    const nl = !liked; setLiked(nl); setLikeCount(p => nl?p+1:p-1)
    try {
      if (nl) {
        await supabase.from('likes').insert({ user_id:user.id, post_id:postId })
        if (post.user_id !== user.id) await supabase.from('notifications').insert({ user_id:post.user_id, from_user_id:user.id, type:'like', post_id:postId })
      } else {
        const { data } = await supabase.from('likes').select('id').eq('user_id',user.id).eq('post_id',postId).single()
        if (data) await supabase.from('likes').delete().eq('id',data.id)
      }
    } catch { setLiked(!nl); setLikeCount(p => nl?p-1:p+1) }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return
    setSubmitting(true)
    try {
      const { data:c, error } = await supabase.from('comments').insert({ post_id:postId, user_id:user.id, content:newComment.trim() }).select('*, profiles(*)').single()
      if (error) throw error
      setComments(p => [...p, c]); setNewComment('')
      if (post.user_id !== user.id) await supabase.from('notifications').insert({ user_id:post.user_id, from_user_id:user.id, type:'comment', post_id:postId })
    } catch { toast.error('Errore nel commento') }
    finally { setSubmitting(false) }
  }

  const handleDeleteComment = async (id) => {
    if (!confirm('Eliminare commento?')) return
    await supabase.from('comments').delete().eq('id', id)
    setComments(p => p.filter(c => c.id !== id))
    toast.success('Commento eliminato')
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) navigator.share({ url })
    else { await navigator.clipboard.writeText(url); toast.success('Link copiato!') }
  }

  if (loading) return <div className="page-loader"><div className="spinner"/></div>
  if (!post) return <div className="page-loader"><p>Post non trovato</p></div>

  const pf = post.profiles
  const initials = (pf?.full_name || pf?.username || 'U').slice(0,2).toUpperCase()

  return (
    <div className="post-detail-page animate-fadeIn">
      <Link to="/" className="post-detail-back"><FiArrowLeft size={18}/> Feed</Link>

      <article className="card post-detail-main">
        <div className="pd-head">
          <Link to={`/profile/${post.user_id}`} className="pd-author">
            <div className="avatar avatar-md">
              {pf?.avatar_url ? <img src={pf.avatar_url} alt=""/> : initials}
            </div>
            <div>
              <div className="pd-name">{pf?.full_name || pf?.username}</div>
              <div className="pd-time">{formatDistanceToNow(new Date(post.created_at), { locale:it, addSuffix:true })}</div>
            </div>
          </Link>
        </div>
        <div className="pd-body">
          {post.content && <p className="pd-text">{post.content}</p>}
          {post.image_url && <img src={post.image_url} alt="Post" className="pd-img"/>}
        </div>
        <div className="pd-actions">
          <button className={`post-action ${liked?'liked':''}`} onClick={handleLike}>
            <FiHeart size={18} fill={liked?'currentColor':'none'}/> {likeCount}
          </button>
          <button className="post-action" onClick={handleShare}><FiShare2 size={18}/> Condividi</button>
        </div>
      </article>

      <section className="pd-comments">
        <h3>{comments.length} Commenti</h3>
        {user ? (
          <form onSubmit={handleComment} className="pd-comment-form">
            <div className="avatar avatar-sm">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt=""/> : (profile?.full_name||'U').slice(0,2).toUpperCase()}
            </div>
            <input className="pd-comment-input" placeholder="Scrivi un commento…" value={newComment} onChange={e=>setNewComment(e.target.value)} maxLength={500}/>
            <button type="submit" className="btn btn-primary btn-sm" disabled={!newComment.trim()||submitting}>
              {submitting ? <span className="spinner spinner-sm btn-spin"/> : <FiSend size={15}/>}
            </button>
          </form>
        ) : (
          <p className="pd-login-prompt"><Link to="/login">Accedi</Link> per commentare</p>
        )}

        <div className="pd-comments-list">
          {comments.map(c => {
            const cp = c.profiles
            const ci = (cp?.full_name||cp?.username||'U').slice(0,2).toUpperCase()
            return (
              <div key={c.id} className="pd-comment">
                <Link to={`/profile/${c.user_id}`}>
                  <div className="avatar avatar-sm">{cp?.avatar_url ? <img src={cp.avatar_url} alt=""/> : ci}</div>
                </Link>
                <div className="pd-comment-body">
                  <div className="pd-comment-header">
                    <Link to={`/profile/${c.user_id}`} className="pd-comment-name">{cp?.full_name||cp?.username}</Link>
                    <span className="pd-comment-time">{formatDistanceToNow(new Date(c.created_at),{locale:it,addSuffix:true})}</span>
                  </div>
                  <p className="pd-comment-text">{c.content}</p>
                </div>
                {c.user_id === user?.id && (
                  <button className="pd-comment-del" onClick={() => handleDeleteComment(c.id)}><FiTrash2 size={14}/></button>
                )}
              </div>
            )
          })}
          {comments.length === 0 && <p className="pd-no-comments">Nessun commento. Sii il primo!</p>}
        </div>
      </section>
    </div>
  )
}
