import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { pb } from '../../lib/pocketbase'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'
import { InlineLoader } from '../../components/ui/Loading'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import { FiHeart, FiMessageCircle, FiShare2, FiArrowLeft } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './PostDetail.css'

export function PostDetailPage() {
  const { postId } = useParams()
  const { user, profile } = useAuth()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  useEffect(() => {
    fetchPost()
    fetchComments()
  }, [postId])

  const fetchPost = async () => {
    try {
      const postData = await pb.collection('posts').getOne(postId, {
        expand: 'profiles,likes',
      })

      setPost(postData)
      setLiked(postData.expand?.likes?.some(l => l.user_id === user?.id) || false)
      setLikeCount(postData.expand?.likes?.length || 0)
    } catch (error) {
      console.error('Error fetching post:', error)
      toast.error('Post non trovato')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const commentsData = await pb.collection('comments').getList(1, 100, {
        filter: `post_id = "${postId}"`,
        sort: 'created',
        expand: 'profiles',
      })
      setComments(commentsData.items)
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast.error('Devi accedere per mettere like')
      return
    }

    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1)

    try {
      if (newLiked) {
        await pb.collection('likes').create({
          user_id: user.id,
          post_id: postId
        })
      } else {
        const records = await pb.collection('likes').getFullList({
          filter: `user_id = "${user.id}" && post_id = "${postId}"`
        })
        if (records.length > 0) {
          await pb.collection('likes').delete(records[0].id)
        }
      }
    } catch (error) {
      setLiked(!newLiked)
      setLikeCount(prev => newLiked ? prev - 1 : prev + 1)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    setSubmitting(true)
    try {
      const data = {
        post_id: postId,
        user_id: user.id,
        content: newComment.trim(),
        expand: 'profiles',
      }

      const comment = await pb.collection('comments').create(data)
      
      // Fetch the comment with expanded profile
      const fullComment = await pb.collection('comments').getOne(comment.id, {
        expand: 'profiles',
      })

      setComments(prev => [...prev, fullComment])
      setNewComment('')
      toast.success('Commento aggiunto')
      
      if (post?.user_id !== user.id) {
        await pb.collection('notifications').create({
          user_id: post.user_id,
          from_user_id: user.id,
          type: 'comment',
          post_id: postId,
          message: `${profile?.name || profile?.username} ha commentato il tuo post`
        })
      }
    } catch (error) {
      toast.error("Errore nell'aggiungere il commento")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Eliminare questo commento?')) return

    try {
      await pb.collection('comments').delete(commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
      toast.success('Commento eliminato')
    } catch (error) {
      toast.error("Errore nell'eliminare il commento")
    }
  }

  if (loading) {
    return (
      <div className="post-detail-loading">
        <InlineLoader text="Caricamento post..." />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="post-detail-error">
        <h2>Post non trovato</h2>
        <Link to="/">
          <Button>Torna alla home</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="post-detail-page">
      <Link to="/" className="post-detail-back">
        <FiArrowLeft size={20} />
        <span>Torna al feed</span>
      </Link>

      <Card className="post-detail-main">
        <div className="post-detail-header">
          <Link to={`/profile/${post.expand?.profiles?.id}`} className="post-detail-author">
            <Avatar
              src={post.expand?.profiles?.avatar}
              alt={post.expand?.profiles?.name || post.expand?.profiles?.username}
              size="md"
            />
            <div className="post-detail-author-info">
              <span className="post-detail-author-name">
                {post.expand?.profiles?.name || post.expand?.profiles?.username}
              </span>
              <span className="post-detail-time">
                {formatDistanceToNow(new Date(post.created), { locale: it, addSuffix: true })}
              </span>
            </div>
          </Link>
        </div>

        <div className="post-detail-content">
          {post.content && <p>{post.content}</p>}
          {post.image && (
            <img 
              src={pb.files.getUrl(post, post.image)} 
              alt="Post" 
              className="post-detail-image" 
            />
          )}
        </div>

        <div className="post-detail-actions">
          <button
            className={`post-detail-action ${liked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <FiHeart fill={liked ? 'currentColor' : 'none'} />
            <span>{likeCount}</span>
          </button>
          <button className="post-detail-action">
            <FiMessageCircle />
            <span>{comments.length}</span>
          </button>
          <button className="post-detail-action">
            <FiShare2 />
          </button>
        </div>
      </Card>

      <section className="post-detail-comments">
        <h3>Commenti ({comments.length})</h3>

        {user ? (
          <form onSubmit={handleComment} className="comment-form">
            <Avatar
              src={profile?.avatar}
              alt={profile?.name || 'User'}
              size="sm"
            />
            <input
              type="text"
              placeholder="Scrivi un commento..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="comment-input"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newComment.trim() || submitting}
              loading={submitting}
            >
              Pubblica
            </Button>
          </form>
        ) : (
          <p className="comment-login-prompt">
            <Link to="/login">Accedi</Link> per commentare
          </p>
        )}

        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <Link to={`/profile/${comment.expand?.profiles?.id}`}>
                <Avatar
                  src={comment.expand?.profiles?.avatar}
                  alt={comment.expand?.profiles?.name || comment.expand?.profiles?.username}
                  size="sm"
                />
              </Link>
              <div className="comment-content">
                <Link to={`/profile/${comment.expand?.profiles?.id}`} className="comment-author">
                  {comment.expand?.profiles?.name || comment.expand?.profiles?.username}
                </Link>
                <p className="comment-text">{comment.content}</p>
                <span className="comment-time">
                  {formatDistanceToNow(new Date(comment.created), { locale: it, addSuffix: true })}
                </span>
              </div>
              {comment.user_id === user?.id && (
                <button
                  className="comment-delete"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  Elimina
                </button>
              )}
            </div>
          ))}

          {comments.length === 0 && (
            <p className="no-comments">Nessun commento ancora. Sii il primo!</p>
          )}
        </div>
      </section>
    </div>
  )
}
