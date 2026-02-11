import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { pb } from '../../lib/pocketbase'
import { useAuth } from '../../context/AuthContext'
import { InlineLoader } from '../../components/ui/Loading'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import { FiHeart, FiUserPlus, FiMessageCircle, FiBell } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './Notifications.css'

export function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [empty, setEmpty] = useState(false)

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const result = await pb.collection('notifications').getList(1, 50, {
        filter: `user_id = "${user.id}"`,
        sort: '-created',
        expand: 'from_profiles',
      })
      
      setNotifications(result.items)
      setEmpty(result.items.length === 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Errore nel caricamento delle notifiche')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await pb.collection('notifications').update(notificationId, {
        read: true
      })

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read)
      for (const n of unread) {
        await pb.collection('notifications').update(n.id, { read: true })
      }
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success('Tutte le notifiche segnate come lette')
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await pb.collection('notifications').delete(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <FiHeart className="notification-icon like" />
      case 'follow':
        return <FiUserPlus className="notification-icon follow" />
      case 'comment':
        return <FiMessageCircle className="notification-icon comment" />
      default:
        return <FiBell className="notification-icon" />
    }
  }

  const getNotificationText = (notification) => {
    const fromName = notification.expand?.from_profiles?.name ||
                     notification.expand?.from_profiles?.username ||
                     'Qualcuno'

    switch (notification.type) {
      case 'like':
        return <>{fromName} ha messo like al tuo post</>
      case 'follow':
        return <>{fromName} ha iniziato a seguirti</>
      case 'comment':
        return <>ha commentato il tuo post</>
      default:
        return notification.message || 'Nuova notifica'
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="notifications-loading">
        <InlineLoader text="Caricamento notifiche..." />
      </div>
    )
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifiche</h1>
        {unreadCount > 0 && (
          <button className="mark-all-read" onClick={markAllAsRead}>
            Segna tutte come lette
          </button>
        )}
      </div>

      {empty ? (
        <Card className="notifications-empty">
          <FiBell size={48} />
          <h2>Nessuna notifica</h2>
          <p>Quando qualcuno interagisce con te, lo vedrai qui.</p>
        </Card>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <Card
              key={notification.id}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              padding={false}
            >
              <Link
                to={notification.post_id ? `/post/${notification.post_id}` : `/profile/${notification.from_user_id}`}
                className="notification-link"
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="notification-avatar">
                  <Avatar
                    src={notification.expand?.from_profiles?.avatar}
                    alt={notification.expand?.from_profiles?.name || notification.expand?.from_profiles?.username}
                    size="md"
                  />
                  <div className="notification-icon-wrapper">
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>
                <div className="notification-content">
                  <p className="notification-text">
                    <strong>{notification.expand?.from_profiles?.name ||
                            notification.expand?.from_profiles?.username}</strong>{' '}
                    {getNotificationText(notification)}
                  </p>
                  <span className="notification-time">
                    {formatDistanceToNow(new Date(notification.created), { locale: it, addSuffix: true })}
                  </span>
                </div>
                {!notification.read && <span className="notification-dot" />}
              </Link>
              <button
                className="notification-delete"
                onClick={() => deleteNotification(notification.id)}
                title="Elimina notifica"
              >
                &times;
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
