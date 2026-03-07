import { useState, useEffect, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { PostCard } from '../PostCard/PostCard'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { FiAlertCircle, FiInbox } from 'react-icons/fi'
import './Feed.css'

const PER_PAGE = 10

export function Feed({ userId = null, type = null }) {
  const { user } = useAuth()
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage]       = useState(0)

  const { ref, inView } = useInView({ threshold:0, rootMargin:'150px' })

  const fetchPosts = useCallback(async (pageNum, refresh = false) => {
    try {
      setError(null)
      let q = supabase
        .from('posts')
        .select(`*, profiles(id,username,full_name,avatar_url), likes(count), comments(count)`, { count:'exact' })
        .order('created_at', { ascending:false })
        .range(pageNum * PER_PAGE, (pageNum+1) * PER_PAGE - 1)

      if (userId) q = q.eq('user_id', userId)
      if (type)   q = q.eq('type', type)

      const { data, error:qErr, count } = await q
      if (qErr) throw qErr

      let likedIds = [], savedIds = []
      if (user && data?.length) {
        const ids = data.map(p => p.id)
        const [likesRes, savedRes] = await Promise.all([
          supabase.from('likes').select('post_id').eq('user_id', user.id).in('post_id', ids),
          supabase.from('collections').select('post_id').eq('user_id', user.id).in('post_id', ids)
        ])
        likedIds = likesRes.data?.map(l => l.post_id) || []
        savedIds = savedRes.data?.map(s => s.post_id) || []
      }

      const transformed = (data || []).map(p => ({
        ...p,
        like_count:    p.likes?.[0]?.count    || 0,
        comment_count: p.comments?.[0]?.count || 0,
        liked_by_user: likedIds.includes(p.id),
        saved_by_user: savedIds.includes(p.id),
      }))

      setPosts(prev => refresh ? transformed : [...prev, ...transformed])
      setHasMore(transformed.length === PER_PAGE && (count || 0) > (pageNum+1)*PER_PAGE)
    } catch (e) {
      console.error(e)
      setError('Errore nel caricamento dei post')
    } finally { setLoading(false) }
  }, [userId, type, user])

  useEffect(() => { setLoading(true); setPage(0); fetchPosts(0, true) }, [userId, type])
  useEffect(() => { if (inView && hasMore && !loading && page > 0) fetchPosts(page) }, [page])
  useEffect(() => { if (inView && hasMore && !loading) setPage(p => p+1) }, [inView])

  const handleDelete = (id)      => setPosts(p => p.filter(x => x.id !== id))
  const handleUpdate = (updated) => setPosts(p => p.map(x => x.id === updated.id ? { ...x, ...updated } : x))

  if (loading && posts.length === 0) return (
    <div className="feed-skeletons">
      {[1,2,3].map(i => <div key={i} className="post-skeleton card"><div className="skeleton" style={{height:80}}/><div style={{padding:'1rem'}}><div className="skeleton" style={{height:60}}/></div></div>)}
    </div>
  )

  if (error) return (
    <div className="feed-error card">
      <FiAlertCircle size={40}/>
      <p>{error}</p>
      <button className="btn btn-primary btn-sm" onClick={() => fetchPosts(0,true)}>Riprova</button>
    </div>
  )

  if (posts.length === 0) return (
    <div className="feed-empty card">
      <FiInbox size={40}/>
      <p>Nessun post ancora.</p>
      <small>Condividi qualcosa per iniziare!</small>
    </div>
  )

  return (
    <div className="feed">
      {posts.map(post => <PostCard key={post.id} post={post} onDelete={handleDelete} onUpdate={handleUpdate} />)}
      {hasMore && <div ref={ref} className="feed-loader"><div className="spinner spinner-sm"/></div>}
    </div>
  )
}
