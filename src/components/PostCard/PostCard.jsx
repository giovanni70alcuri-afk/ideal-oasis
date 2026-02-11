import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import { FiHeart, FiMessageCircle, FiTrash2, FiMoreHorizontal } from 'react-icons/fi'
import { Avatar } from '../ui/Avatar'
import { Card } from '../ui/Card'
import { useAuth } from '../../context/AuthContext'
import { pb } from '../../lib/pocketbase'
import toast from 'react-hot-toast'
import './PostCard.css'

export function PostCard({ post, onUpdate, onDelete }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [liked, setLiked] = useState(post?.liked_by_current_user || false)
  const [likeCount, setLikeCount] = useState(post?.like_count || 0)

  const isOwner = user?.id === post?.user_id

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
          post_id: post.id
        })
      } else {
        const records = await pb.collection('likes').getFullList({
          filter: `user_id = "${user.id}" && post_id = "${post.id}"`
        })
        if (records.length > 0) {
          await pb.collection('likes').delete(records[0].id)
        }
      }
    } catch (error) {
      setLiked(!newLiked)
      setLikeCount(prev => newLiked ? prev - 1 : prev + 1)
      toast.error('Errore durante il like')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Sei sicuro di voler eliminare questo post?')) return

    setLoading(true)
    try {
      await pb.collection('posts').delete(post.id)
      toast.success('Post eliminato')
      onDelete?.(post.id)
    } catch (error) {
      toast.error("Errore durante l'eliminazione")
    } finally {
      setLoading(false)
      setShowMenu(false)
    }
  }

  const timeAgo = post?.created
    ? formatDistanceToNow(new Date(post.created), { locale: it, addSuffix: true })
    : ''

  return (
    <Card className="post-card">
      <div className="post-header">
        <Link to={`/profile/${post?.user_id}`} className="post-author">
          <Avatar
            src={post?.expand?.profiles?.avatar_url}
            alt={post?.expand?.profiles?.name || post?.expand?.profiles?.username || 'User'}
            size="md"
          />
          <div className="post-author-info">
            <span className="post-author-name">
              {post?.expand?.profiles?.name || post?.expand?.profiles?.username || 'Utente'}
            </span>
            <span className="post-time">{timeAgo}</span>
          </div>
        </Link>

        <div className="post-menu-wrapper">
          <button
            className="post-menu-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            <FiMoreHorizontal size={20} />
          </button>
          
          {showMenu && (
            <div className="post-menu">
              {isOwner && (
                <button className="post-menu-item danger" onClick={handleDelete} disabled={loading}>
                  <FiTrash2 size={18} />
                  Elimina
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="post-content">
        {post?.content && <p className="post-text">{post.content}</p>}
        
        {post?.image && (
          <div className="post-image-wrapper">
            <img 
              src={pb.files.getUrl(post, post.image)} 
              alt="Post" 
              className="post-image" 
              loading="lazy" 
            />
          </div>
        )}
      </div>

      <div className="post-actions">
        <button
          className={`post-action ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={loading}
        >
          <FiHeart size={20} fill={liked ? 'currentColor' : 'none'} />
          <span>{likeCount > 0 ? likeCount : ''}</span>
        </button>
        
        <Link to={`/post/${post.id}`} className="post-action">
          <FiMessageCircle size={20} />
          <span>{post?.comment_count > 0 ? post.comment_count : ''}</span>
        </Link>
      </div>
    </Card>
  )
}
