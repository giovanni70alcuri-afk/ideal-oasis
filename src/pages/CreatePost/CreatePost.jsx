import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { pb } from '../../lib/pocketbase'
import { useAuth } from '../../context/AuthContext'
import { Textarea } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { FiImage, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './CreatePost.css'

export function CreatePostPage() {
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error("Devi selezionare un' immagine")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L' immagine deve essere inferiore a 5MB")
      return
    }

    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim() && !image) {
      toast.error("Scrivi qualcosa o aggiungi un' immagine")
      return
    }

    setLoading(true)

    try {
      const data = {
        user_id: user.id,
        content: content.trim(),
      }

      if (image) {
        data.image = image
      }

      await pb.collection('posts').create(data)

      toast.success('Post pubblicato!')
      navigate('/')
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error(error.message || 'Errore nella pubblicazione del post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-post-page">
      <Card className="create-post-card">
        <CardHeader>
          <h1>Crea un post</h1>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="create-post-form">
            <div className="create-post-content">
              <div className="create-post-avatar">
                <img 
                  src={profile?.avatar || '/default-avatar.png'} 
                  alt={profile?.name || 'User'}
                />
              </div>
              <Textarea
                placeholder="Cosa stai pensando?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="create-post-textarea"
              />
            </div>

            {imagePreview && (
              <div className="create-post-image-preview">
                <img src={imagePreview} alt="Preview" />
                <button type="button" className="remove-image-btn" onClick={removeImage}>
                  <FiX size={20} />
                </button>
              </div>
            )}

            <div className="create-post-actions">
              <label className="create-post-image-btn">
                <FiImage size={20} />
                <span>Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  hidden
                />
              </label>

              <div className="create-post-submit">
                <Button 
                  type="submit" 
                  disabled={loading}
                  loading={loading}
                >
                  Pubblica
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
