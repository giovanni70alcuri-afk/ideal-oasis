import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { pb } from '../../lib/pocketbase'
import { useAuth } from '../../context/AuthContext'
import { Feed } from '../../components/Feed/Feed'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'
import { InlineLoader } from '../../components/ui/Loading'
import { FiUserPlus, FiUserMinus, FiMapPin, FiCalendar } from 'react-icons/fi'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import toast from 'react-hot-toast'
import './Profile.css'

export function ProfilePage() {
  const { userId } = useParams()
  const { user: currentUser, profile: currentProfile } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  const isOwnProfile = currentUser?.id === userId

  useEffect(() => {
    fetchProfile()
    checkFollowing()
    fetchFollowCounts()
  }, [userId])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const profileData = await pb.collection('profiles').getOne(userId)
      setProfile(profileData)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Errore nel caricamento del profilo')
    } finally {
      setLoading(false)
    }
  }

  const checkFollowing = async () => {
    if (!currentUser) return
    
    try {
      const follows = await pb.collection('follows').getList(1, 1, {
        filter: `follower_id = "${currentUser.id}" && following_id = "${userId}"`
      })
      setIsFollowing(follows.items.length > 0)
    } catch (error) {
      setIsFollowing(false)
    }
  }

  const fetchFollowCounts = async () => {
    try {
      const followers = await pb.collection('follows').getList(1, 1, {
        filter: `following_id = "${userId}"`
      })
      const following = await pb.collection('follows').getList(1, 1, {
        filter: `follower_id = "${userId}"`
      })
      setFollowersCount(followers.totalItems)
      setFollowingCount(following.totalItems)
    } catch (error) {
      console.error('Error fetching follow counts:', error)
    }
  }

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error('Devi accedere per seguire')
      return
    }

    try {
      if (isFollowing) {
        const follows = await pb.collection('follows').getList(1, 1, {
          filter: `follower_id = "${currentUser.id}" && following_id = "${userId}"`
        })
        if (follows.items.length > 0) {
          await pb.collection('follows').delete(follows.items[0].id)
        }
        setIsFollowing(false)
        setFollowersCount(prev => prev - 1)
        toast.success('Non segui più questo utente')
      } else {
        await pb.collection('follows').create({
          follower_id: currentUser.id,
          following_id: userId
        })
        setIsFollowing(true)
        setFollowersCount(prev => prev + 1)
        toast.success('Ora segui questo utente')
        
        // Create notification
        await pb.collection('notifications').create({
          user_id: userId,
          from_user_id: currentUser.id,
          type: 'follow',
          message: `${currentProfile?.name || currentProfile?.username} ha iniziato a seguirti`
        })
      }
    } catch (error) {
      toast.error("Errore durante l'operazione")
    }
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <InlineLoader text="Caricamento profilo..." />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="profile-error">
        <h2>Utente non trovato</h2>
        <p>Questo profilo non esiste o è stato rimosso.</p>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <Card className="profile-header-card">
        <CardBody>
          <div className="profile-header">
            <Avatar
              src={profile?.avatar}
              alt={profile?.name || profile?.username}
              size="xl"
            />
            
            <div className="profile-info">
              <h1 className="profile-name">{profile?.name || profile?.username}</h1>
              {profile?.username && (
                <p className="profile-username">@{profile.username}</p>
              )}
              
              {profile?.bio && (
                <p className="profile-bio">{profile.bio}</p>
              )}

              <div className="profile-meta">
                {profile?.location && (
                  <span className="profile-meta-item">
                    <FiMapPin size={14} />
                    {profile.location}
                  </span>
                )}
                <span className="profile-meta-item">
                  <FiCalendar size={14} />
                  Membro da {format(new Date(profile.created), 'MMM yyyy', { locale: it })}
                </span>
              </div>

              <div className="profile-stats">
                <div className="profile-stat">
                  <span className="profile-stat-value">{followersCount}</span>
                  <span className="profile-stat-label">Follower</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value">{followingCount}</span>
                  <span className="profile-stat-label">Seguiti</span>
                </div>
              </div>

              {!isOwnProfile && (
                <Button
                  variant={isFollowing ? 'outline' : 'primary'}
                  onClick={handleFollow}
                  className="profile-follow-btn"
                >
                  {isFollowing ? (
                    <>
                      <FiUserMinus size={18} />
                      Non seguire più
                    </>
                  ) : (
                    <>
                      <FiUserPlus size={18} />
                      Segui
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      <section className="profile-posts">
        <h2 className="profile-posts-title">Post</h2>
        <Feed userId={userId} />
      </section>
    </div>
  )
}
