import { useState, useEffect, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { PostCard } from '../PostCard/PostCard'
import { InlineLoader, Skeleton } from '../ui/Loading'
import { pb } from '../../lib/pocketbase'
import { FiAlertCircle } from 'react-icons/fi'
import './Feed.css'

const ITEMS_PER_PAGE = 10

export function Feed({ userId = null }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  })

  const fetchPosts = useCallback(async (pageNum, isRefresh = false) => {
    try {
      setError(null)
      
      const options = {
        expand: 'profiles,likes,comments',
        sort: '-created',
        perPage: ITEMS_PER_PAGE,
        page: pageNum + 1,
      }

      if (userId) {
        options.filter = `user_id = "${userId}"`
      }

      const result = await pb.collection('posts').getList(pageNum + 1, ITEMS_PER_PAGE, options)

      // Transform PocketBase data to our format
      const transformedPosts = result.items.map(post => ({
        ...post,
        profiles: post.expand?.profiles,
        liked_by_current_user: post.expand?.likes?.some(l => l.user_id === post.user_id) || false,
        like_count: post.expand?.likes?.length || 0,
        comment_count: post.expand?.comments?.length || 0
      }))

      setPosts(prev => isRefresh ? transformedPosts : [...prev, ...transformedPosts])
      setHasMore(result.items.length === ITEMS_PER_PAGE && result.totalItems > posts.length + transformedPosts.length)
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError('Errore nel caricamento dei post')
    } finally {
      setLoading(false)
    }
  }, [userId, posts.length])

  // Initial load and refresh
  useEffect(() => {
    setLoading(true)
    setPage(0)
    fetchPosts(0, true)
  }, [userId])

  // Infinite scroll
  useEffect(() => {
    if (inView && hasMore && !loading && page > 0) {
      fetchPosts(page)
    }
  }, [inView, hasMore, loading])

  // Handle page increment when scrolling
  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage(prev => prev + 1)
    }
  }, [inView, hasMore, loading])

  const handleDelete = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  const handleUpdate = (updatedPost) => {
    setPosts(prev => prev.map(p => 
      p.id === updatedPost.id ? { ...p, ...updatedPost } : p
    ))
  }

  if (loading && posts.length === 0) {
    return (
      <div className="feed">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="feed-skeleton">
            <Skeleton height={80} radius="var(--border-radius)" />
            <div style={{ padding: '1.5rem' }}>
              <Skeleton height={100} radius="var(--border-radius)" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="feed-error">
        <FiAlertCircle size={48} />
        <p>{error}</p>
        <button onClick={() => { setError(null); fetchPosts(0, true); }}>
          Riprova
        </button>
      </div>
    )
  }

  return (
    <div className="feed">
      {posts.length === 0 ? (
        <div className="feed-empty">
          <p>Nessun post ancora.</p>
          <p>Condividi qualcosa per iniziare!</p>
        </div>
      ) : (
        <>
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
          
          {hasMore && (
            <div ref={ref} className="feed-load-more">
              <InlineLoader text="Caricamento altri post..." />
            </div>
          )}
        </>
      )}
    </div>
  )
}
